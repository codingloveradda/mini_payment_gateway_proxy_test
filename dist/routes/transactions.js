"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const transactionLogger_1 = require("../services/transactionLogger");
const llmCache_1 = require("../services/llmCache");
const router = (0, express_1.Router)();
router.get('/', (req, res) => {
    try {
        const { status, limit, offset } = req.query;
        let transactions = transactionLogger_1.transactionLogger.getAllTransactions();
        // Filter by status if provided
        if (status && (status === 'success' || status === 'blocked')) {
            transactions = transactionLogger_1.transactionLogger.getTransactionsByStatus(status);
        }
        // Apply pagination with proper parsing
        const limitNum = limit && !isNaN(Number(limit)) ? parseInt(limit) : 50;
        const offsetNum = offset && !isNaN(Number(offset)) ? parseInt(offset) : 0;
        const paginatedTransactions = transactions.slice(offsetNum, offsetNum + limitNum);
        // Get statistics
        const stats = transactionLogger_1.transactionLogger.getTransactionStats();
        const cacheStats = llmCache_1.llmCache.getStats();
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
    }
    catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ error: 'Failed to fetch transactions' });
    }
});
exports.default = router;
