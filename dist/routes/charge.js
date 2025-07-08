"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const paymentController_1 = require("../controllers/paymentController");
const fraudAnalysis_1 = require("../services/fraudAnalysis");
const transactionLogger_1 = require("../services/transactionLogger");
const router = (0, express_1.Router)();
function chargeHandler(req, res) {
    const startTime = Date.now();
    (() => __awaiter(this, void 0, void 0, function* () {
        const { amount, currency, source, email } = req.body;
        if (typeof amount !== 'number' || !currency || !source || !email) {
            return res.status(400).json({ error: 'Invalid request body' });
        }
        // Calculate risk score using sophisticated fraud analysis
        const riskScore = yield (0, fraudAnalysis_1.calculateFraudRiskScore)({
            amount,
            email,
            currency,
            source
        });
        // Generate human-readable explanation using LLM
        const explanation = yield (0, fraudAnalysis_1.generateRiskExplanation)(riskScore, {
            amount,
            email,
            currency,
            source
        });
        const processingTime = Date.now() - startTime;
        // Block high-risk transactions (score ≥ 0.5)
        if (riskScore >= 0.5) {
            // Log blocked transaction
            transactionLogger_1.transactionLogger.logTransaction(amount, currency, email, source, riskScore, 'blocked', null, null, explanation, {
                userAgent: req.get('User-Agent'),
                ipAddress: req.ip || req.connection.remoteAddress,
                processingTime
            });
            return res.status(403).json({
                transactionId: null,
                provider: null,
                status: 'blocked',
                riskScore: parseFloat(riskScore.toFixed(2)),
                explanation: `Transaction blocked due to high fraud risk. ${explanation}`
            });
        }
        // Route low-risk transactions to payment processor
        const result = yield (0, paymentController_1.processStripePayment)({ amount, currency, source });
        // Log successful transaction
        transactionLogger_1.transactionLogger.logTransaction(amount, currency, email, source, riskScore, 'success', 'stripe', result.transactionId, explanation, {
            userAgent: req.get('User-Agent'),
            ipAddress: req.ip || req.connection.remoteAddress,
            processingTime
        });
        return res.json({
            transactionId: result.transactionId,
            provider: 'stripe',
            status: result.status,
            riskScore: parseFloat(riskScore.toFixed(2)),
            explanation
        });
    }))().catch((err) => {
        console.error('Error in charge handler:', err);
        res.status(500).json({ error: 'Internal server error', details: err.message });
    });
}
router.post('/', chargeHandler);
exports.default = router;
