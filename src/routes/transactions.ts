import { Router, Request, Response } from 'express';
import { transactionLogger } from '../services/transactionLogger';
import { llmCache } from '../services/llmCache';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  try {
    const { status, limit, offset } = req.query;
    
    let transactions = transactionLogger.getAllTransactions();
    
    // Filter by status if provided
    if (status && (status === 'success' || status === 'blocked')) {
      transactions = transactionLogger.getTransactionsByStatus(status as 'success' | 'blocked');
    }
    
    // Apply pagination with proper parsing
    const limitNum = limit && !isNaN(Number(limit)) ? parseInt(limit as string) : 50;
    const offsetNum = offset && !isNaN(Number(offset)) ? parseInt(offset as string) : 0;
    const paginatedTransactions = transactions.slice(offsetNum, offsetNum + limitNum);
    
    // Get statistics
    const stats = transactionLogger.getTransactionStats();
    const cacheStats = llmCache.getStats();
    
    res.json({
      transactions: paginatedTransactions,
      pagination: {
        total: transactions.length,
        limit: limitNum,
        offset: offsetNum,
        hasMore: offsetNum + limitNum < transactions.length
      },
      stats,
      cache: cacheStats
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

export default router; 