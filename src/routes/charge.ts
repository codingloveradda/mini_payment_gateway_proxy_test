import { Router, Request, Response } from 'express';
import { processStripePayment } from '../controllers/paymentController';
import { calculateFraudRiskScore, generateRiskExplanation } from '../services/fraudAnalysis';
import { transactionLogger } from '../services/transactionLogger';
import OpenAI from 'openai';

interface ChargeRequestBody {
  amount: number;
  currency: string;
  source: string;
  email: string;
}

const router = Router();

function chargeHandler(req: Request<{}, {}, ChargeRequestBody>, res: Response) {
  const startTime = Date.now();
  
  (async () => {
    const { amount, currency, source, email } = req.body;

    if (typeof amount !== 'number' || !currency || !source || !email) {
      return res.status(400).json({ error: 'Invalid request body' });
    }

    // Calculate risk score using sophisticated fraud analysis
    const riskScore = await calculateFraudRiskScore({
      amount,
      email,
      currency,
      source
    });
    
    // Generate human-readable explanation using LLM
    const explanation = await generateRiskExplanation(riskScore, {
      amount,
      email,
      currency,
      source
    });
    
    const processingTime = Date.now() - startTime;
    
    // Block high-risk transactions (score ≥ 0.5)
    if (riskScore >= 0.5) {
      // Log blocked transaction
      transactionLogger.logTransaction(
        amount,
        currency,
        email,
        source,
        riskScore,
        'blocked',
        null,
        null,
        explanation,
        {
          userAgent: req.get('User-Agent'),
          ipAddress: req.ip || req.connection.remoteAddress,
          processingTime
        }
      );
      
      return res.status(403).json({
        transactionId: null,
        provider: null,
        status: 'blocked',
        riskScore: parseFloat(riskScore.toFixed(2)),
        explanation: `Transaction blocked due to high fraud risk. ${explanation}`
      });
    }
    
    // Route low-risk transactions to payment processor
    const result = await processStripePayment({ amount, currency, source });

    // Log successful transaction
    transactionLogger.logTransaction(
      amount,
      currency,
      email,
      source,
      riskScore,
      'success',
      'stripe',
      result.transactionId,
      explanation,
      {
        userAgent: req.get('User-Agent'),
        ipAddress: req.ip || req.connection.remoteAddress,
        processingTime
      }
    );

    return res.json({
      transactionId: result.transactionId,
      provider: 'stripe',
      status: result.status,
      riskScore: parseFloat(riskScore.toFixed(2)),
      explanation
    });
  })().catch((err) => {
    console.error('Error in charge handler:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  });
}

router.post('/', chargeHandler);

export default router; 