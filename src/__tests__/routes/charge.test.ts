import request from 'supertest';
import express from 'express';
import chargeRouter from '../../routes/charge';

// Create a test app
const app = express();
app.use(express.json());
app.use('/charge', chargeRouter);

describe('Charge Route', () => {
  describe('POST /charge', () => {
    it('should process low-risk transaction successfully', async () => {
      const payload = {
        amount: 100,
        currency: 'USD',
        source: 'tok_live_123',
        email: 'user@example.com'
      };

      const response = await request(app)
        .post('/charge')
        .send(payload)
        .expect(200);

      expect(response.body).toHaveProperty('transactionId');
      expect(response.body).toHaveProperty('provider');
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('riskScore');
      expect(response.body).toHaveProperty('explanation');

      expect(response.body.provider).toBe('stripe');
      expect(response.body.status).toBe('success');
      expect(response.body.riskScore).toBeLessThan(0.5);
    });

    it('should block high-risk transaction', async () => {
      const payload = {
        amount: 15000,
        currency: 'USD',
        source: 'tok_test_123',
        email: 'user@test.ru'
      };

      const response = await request(app)
        .post('/charge')
        .send(payload)
        .expect(403);

      expect(response.body).toHaveProperty('transactionId');
      expect(response.body).toHaveProperty('provider');
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('riskScore');
      expect(response.body).toHaveProperty('explanation');

      expect(response.body.transactionId).toBeNull();
      expect(response.body.provider).toBeNull();
      expect(response.body.status).toBe('blocked');
      expect(response.body.riskScore).toBeGreaterThanOrEqual(0.5);
    });

    it('should return 400 for invalid request body', async () => {
      const invalidPayloads = [
        { amount: 'invalid', currency: 'USD', source: 'tok_live_123', email: 'user@example.com' },
        { amount: 100, currency: 'USD', source: 'tok_live_123' }, // missing email
        { amount: 100, currency: 'USD', email: 'user@example.com' }, // missing source
        { amount: 100, source: 'tok_live_123', email: 'user@example.com' }, // missing currency
        { currency: 'USD', source: 'tok_live_123', email: 'user@example.com' } // missing amount
      ];

      for (const payload of invalidPayloads) {
        await request(app)
          .post('/charge')
          .send(payload)
          .expect(400);
      }
    });

    it('should handle different currencies', async () => {
      const payload = {
        amount: 500,
        currency: 'EUR',
        source: 'tok_live_123',
        email: 'user@example.com'
      };

      const response = await request(app)
        .post('/charge')
        .send(payload)
        .expect(200);

      expect(response.body.status).toBe('success');
    });

    it('should handle test tokens', async () => {
      const payload = {
        amount: 100,
        currency: 'USD',
        source: 'tok_test_123',
        email: 'user@example.com'
      };

      const response = await request(app)
        .post('/charge')
        .send(payload);

      // Should either be processed (low risk) or blocked (high risk)
      expect([200, 403]).toContain(response.status);
      expect(response.body).toHaveProperty('riskScore');
      expect(response.body).toHaveProperty('explanation');
    });

    it('should handle suspicious email domains', async () => {
      const response = await request(app)
        .post('/charge')
        .send({
          amount: 6000, // high amount to increase risk
          currency: 'USD',
          source: 'tok_test_123',
          email: 'fraudster@evil.ru' // .ru domain triggers high risk
        });

      // Should be blocked due to suspicious domain and high amount
      expect(response.status).toBe(403);
      expect(response.body.status).toBe('blocked');
      expect(response.body.riskScore).toBeGreaterThanOrEqual(0.5);
    });

    it('should handle factors', async () => {
      const factors1 = {
        amount: 1200, // "very_high"
        email: 'user@demo.com',
        currency: 'USD',
        source: 'tok_test_123',
        riskScore: 0.3
      };

      const factors2 = {
        amount: 2000, // "very_high"
        email: 'other@demo.com',
        currency: 'USD',
        source: 'tok_test_456',
        riskScore: 0.35
      };

      // Add more test cases as needed
    });
  });
}); 