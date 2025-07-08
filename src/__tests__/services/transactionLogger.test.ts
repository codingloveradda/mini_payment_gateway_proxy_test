import { transactionLogger } from '../../services/transactionLogger';

describe('Transaction Logger Service', () => {
  beforeEach(() => {
    // Clear all transactions before each test
    const allTransactions = transactionLogger.getAllTransactions();
    allTransactions.forEach(() => {
      // Note: In a real implementation, we'd need a clear method
      // For now, we'll work with the existing data
    });
  });

  describe('logTransaction', () => {
    it('should log successful transaction', () => {
      const metadata = {
        userAgent: 'Mozilla/5.0',
        ipAddress: '192.168.1.1',
        processingTime: 150
      };

      transactionLogger.logTransaction(
        1000,
        'USD',
        'user@example.com',
        'tok_live_123',
        0.3,
        'success',
        'stripe',
        'stripe_123456',
        'Transaction processed successfully',
        metadata
      );

      const transactions = transactionLogger.getAllTransactions();
      expect(transactions.length).toBeGreaterThan(0);

      const lastTransaction = transactions[0];
      expect(lastTransaction.amount).toBe(1000);
      expect(lastTransaction.currency).toBe('USD');
      expect(lastTransaction.email).toBe('user@example.com');
      expect(lastTransaction.source).toBe('tok_live_123');
      expect(lastTransaction.riskScore).toBe(0.3);
      expect(lastTransaction.status).toBe('success');
      expect(lastTransaction.provider).toBe('stripe');
      expect(lastTransaction.transactionId).toBe('stripe_123456');
      expect(lastTransaction.explanation).toBe('Transaction processed successfully');
      expect(lastTransaction.metadata).toEqual(metadata);
    });

    it('should log blocked transaction', () => {
      const metadata = {
        userAgent: 'Mozilla/5.0',
        ipAddress: '192.168.1.1',
        processingTime: 200
      };

      transactionLogger.logTransaction(
        15000,
        'USD',
        'user@test.ru',
        'tok_test_123',
        0.8,
        'blocked',
        null,
        null,
        'Transaction blocked due to high risk',
        metadata
      );

      const transactions = transactionLogger.getAllTransactions();
      expect(transactions.length).toBeGreaterThan(0);

      const lastTransaction = transactions[0];
      expect(lastTransaction.amount).toBe(15000);
      expect(lastTransaction.status).toBe('blocked');
      expect(lastTransaction.provider).toBeUndefined();
      expect(lastTransaction.transactionId).toBeUndefined();
    });
  });

  describe('getAllTransactions', () => {
    it('should return transactions in reverse chronological order', () => {
      // Log multiple transactions
      for (let i = 1; i <= 3; i++) {
        transactionLogger.logTransaction(
          100 * i,
          'USD',
          `user${i}@example.com`,
          'tok_live_123',
          0.3,
          'success',
          'stripe',
          `stripe_${i}`,
          'Transaction processed',
          { processingTime: 100 }
        );
      }

      const transactions = transactionLogger.getAllTransactions();
      expect(transactions.length).toBeGreaterThanOrEqual(3);

      // Check that they're in reverse chronological order
      for (let i = 0; i < transactions.length - 1; i++) {
        expect(transactions[i].timestamp.getTime()).toBeGreaterThanOrEqual(
          transactions[i + 1].timestamp.getTime()
        );
      }
    });
  });

  describe('getTransactionsByStatus', () => {
    it('should filter transactions by status', () => {
      // Log mixed transactions
      transactionLogger.logTransaction(
        1000,
        'USD',
        'user@example.com',
        'tok_live_123',
        0.3,
        'success',
        'stripe',
        'stripe_123',
        'Success',
        { processingTime: 100 }
      );

      transactionLogger.logTransaction(
        15000,
        'USD',
        'user@test.ru',
        'tok_test_123',
        0.8,
        'blocked',
        null,
        null,
        'Blocked',
        { processingTime: 200 }
      );

      const successfulTransactions = transactionLogger.getTransactionsByStatus('success');
      const blockedTransactions = transactionLogger.getTransactionsByStatus('blocked');

      expect(successfulTransactions.length).toBeGreaterThan(0);
      expect(blockedTransactions.length).toBeGreaterThan(0);

      successfulTransactions.forEach(t => {
        expect(t.status).toBe('success');
      });

      blockedTransactions.forEach(t => {
        expect(t.status).toBe('blocked');
      });
    });
  });

  describe('getTransactionStats', () => {
    it('should calculate correct statistics', () => {
      // Log some test transactions
      transactionLogger.logTransaction(
        1000,
        'USD',
        'user@example.com',
        'tok_live_123',
        0.3,
        'success',
        'stripe',
        'stripe_123',
        'Success',
        { processingTime: 100 }
      );

      transactionLogger.logTransaction(
        15000,
        'USD',
        'user@test.ru',
        'tok_test_123',
        0.8,
        'blocked',
        null,
        null,
        'Blocked',
        { processingTime: 200 }
      );

      const stats = transactionLogger.getTransactionStats();

      expect(stats.total).toBeGreaterThan(0);
      expect(stats.successful).toBeGreaterThan(0);
      expect(stats.blocked).toBeGreaterThan(0);
      expect(stats.averageRiskScore).toBeGreaterThan(0);
      expect(stats.totalAmount).toBeGreaterThan(0);
    });
  });
}); 