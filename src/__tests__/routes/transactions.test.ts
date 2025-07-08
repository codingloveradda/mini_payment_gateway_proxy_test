import request from 'supertest';
import express from 'express';
import transactionsRouter from '../../routes/transactions';

// Create a test app
const app = express();
app.use(express.json());
app.use('/transactions', transactionsRouter);

describe('Transactions Route', () => {
  describe('GET /transactions', () => {
    it('should return transactions with pagination', async () => {
      const response = await request(app)
        .get('/transactions')
        .expect(200);

      expect(response.body).toHaveProperty('transactions');
      expect(response.body).toHaveProperty('pagination');
      expect(response.body).toHaveProperty('stats');
      expect(response.body).toHaveProperty('cache');

      expect(Array.isArray(response.body.transactions)).toBe(true);
      expect(response.body.pagination).toHaveProperty('total');
      expect(response.body.pagination).toHaveProperty('limit');
      expect(response.body.pagination).toHaveProperty('offset');
      expect(response.body.pagination).toHaveProperty('hasMore');
      expect(response.body.stats).toHaveProperty('total');
      expect(response.body.stats).toHaveProperty('successful');
      expect(response.body.stats).toHaveProperty('blocked');
      expect(response.body.stats).toHaveProperty('averageRiskScore');
      expect(response.body.stats).toHaveProperty('totalAmount');
      expect(response.body.cache).toHaveProperty('size');
      expect(response.body.cache).toHaveProperty('maxSize');
      expect(response.body.cache).toHaveProperty('hitRate');
      expect(response.body.cache).toHaveProperty('totalHits');
      expect(response.body.cache).toHaveProperty('totalMisses');
    });

    it('should handle status filtering', async () => {
      const response = await request(app)
        .get('/transactions?status=success')
        .expect(200);

      expect(response.body.transactions).toBeDefined();
      expect(Array.isArray(response.body.transactions)).toBe(true);
    });

    it('should handle pagination parameters', async () => {
      const response = await request(app)
        .get('/transactions?limit=10&offset=0')
        .expect(200);

      expect(response.body.pagination.limit).toBe(10);
      expect(response.body.pagination.offset).toBe(0);
    });

    it('should handle invalid status parameter', async () => {
      const response = await request(app)
        .get('/transactions?status=invalid')
        .expect(200);

      // Should return all transactions when status is invalid
      expect(response.body.transactions).toBeDefined();
    });

    it('should handle invalid pagination parameters', async () => {
      const response = await request(app)
        .get('/transactions?limit=invalid&offset=invalid')
        .expect(200);

      // Should use default values for invalid parameters
      expect(response.body.pagination.limit).toBe(50);
      expect(response.body.pagination.offset).toBe(0);
    });

    it('should return cache statistics', async () => {
      const response = await request(app)
        .get('/transactions')
        .expect(200);

      const cache = response.body.cache;
      expect(cache.size).toBeGreaterThanOrEqual(0);
      expect(cache.maxSize).toBe(1000);
      expect(cache.hitRate).toBeGreaterThanOrEqual(0);
      expect(cache.hitRate).toBeLessThanOrEqual(1);
      expect(cache.totalHits).toBeGreaterThanOrEqual(0);
      expect(cache.totalMisses).toBeGreaterThanOrEqual(0);
    });
  });
}); 