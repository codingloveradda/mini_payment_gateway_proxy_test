"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transactionLogger = void 0;
class TransactionLogger {
    constructor() {
        this.transactions = [];
    }
    logTransaction(amount, currency, email, source, riskScore, status, provider, transactionId, explanation, metadata) {
        const transaction = {
            id: this.generateTransactionId(),
            timestamp: new Date(),
            amount,
            currency,
            email,
            source,
            riskScore,
            status,
            provider: provider || undefined,
            transactionId: transactionId || undefined,
            explanation,
            metadata
        };
        this.transactions.push(transaction);
        // Keep only last 1000 transactions to prevent memory issues
        if (this.transactions.length > 1000) {
            this.transactions = this.transactions.slice(-1000);
        }
    }
    getAllTransactions() {
        return [...this.transactions].reverse(); // Most recent first
    }
    getTransactionsByStatus(status) {
        return this.transactions
            .filter(t => t.status === status)
            .reverse();
    }
    getTransactionsByDateRange(startDate, endDate) {
        return this.transactions
            .filter(t => t.timestamp >= startDate && t.timestamp <= endDate)
            .reverse();
    }
    getTransactionStats() {
        const total = this.transactions.length;
        const successful = this.transactions.filter(t => t.status === 'success').length;
        const blocked = this.transactions.filter(t => t.status === 'blocked').length;
        const averageRiskScore = this.transactions.length > 0
            ? this.transactions.reduce((sum, t) => sum + t.riskScore, 0) / this.transactions.length
            : 0;
        const totalAmount = this.transactions
            .filter(t => t.status === 'success')
            .reduce((sum, t) => sum + t.amount, 0);
        return {
            total,
            successful,
            blocked,
            averageRiskScore: parseFloat(averageRiskScore.toFixed(3)),
            totalAmount
        };
    }
    generateTransactionId() {
        return `log_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    }
}
exports.transactionLogger = new TransactionLogger();
