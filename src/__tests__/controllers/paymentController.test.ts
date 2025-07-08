import { processStripePayment, processPayPalPayment } from '../../controllers/paymentController';

describe('Payment Controller', () => {
  describe('processStripePayment', () => {
    it('should process Stripe payment successfully', async () => {
      const paymentRequest = {
        amount: 1000,
        currency: 'USD',
        source: 'tok_live_123'
      };

      const result = await processStripePayment(paymentRequest);

      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('transactionId');

      expect(result.status).toBe('success');
      expect(result.message).toBe('Processed by Stripe');
      expect(result.transactionId).toMatch(/^stripe_\d+$/);
    });

    it('should handle different currencies', async () => {
      const paymentRequest = {
        amount: 500,
        currency: 'EUR',
        source: 'tok_live_456'
      };

      const result = await processStripePayment(paymentRequest);

      expect(result.status).toBe('success');
      expect(result.message).toBe('Processed by Stripe');
    });

    it('should generate unique transaction IDs', async () => {
      const paymentRequest = {
        amount: 100,
        currency: 'USD',
        source: 'tok_live_123'
      };

      const result1 = await processStripePayment(paymentRequest);
      const result2 = await processStripePayment(paymentRequest);

      expect(result1.transactionId).not.toBe(result2.transactionId);
    });
  });

  describe('processPayPalPayment', () => {
    it('should process PayPal payment successfully', async () => {
      const paymentRequest = {
        amount: 1000,
        currency: 'USD',
        source: 'paypal_token_123'
      };

      const result = await processPayPalPayment(paymentRequest);

      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('transactionId');

      expect(result.status).toBe('success');
      expect(result.message).toBe('Processed by PayPal');
      expect(result.transactionId).toMatch(/^paypal_\d+$/);
    });

    it('should handle different currencies', async () => {
      const paymentRequest = {
        amount: 500,
        currency: 'GBP',
        source: 'paypal_token_456'
      };

      const result = await processPayPalPayment(paymentRequest);

      expect(result.status).toBe('success');
      expect(result.message).toBe('Processed by PayPal');
    });

    it('should generate unique transaction IDs', async () => {
      const paymentRequest = {
        amount: 100,
        currency: 'USD',
        source: 'paypal_token_123'
      };

      const result1 = await processPayPalPayment(paymentRequest);
      const result2 = await processPayPalPayment(paymentRequest);

      expect(result1.transactionId).not.toBe(result2.transactionId);
    });
  });

  describe('Payment Request Interface', () => {
    it('should accept valid payment requests', async () => {
      const validRequests = [
        { amount: 100, currency: 'USD', source: 'tok_live_123' },
        { amount: 1000, currency: 'EUR', source: 'paypal_token_456' },
        { amount: 50, currency: 'GBP', source: 'tok_test_789' }
      ];

      for (const request of validRequests) {
        const result = await processStripePayment(request);
        expect(result.status).toBe('success');
      }
    });
  });
}); 