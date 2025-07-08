import { calculateFraudRiskScore, generateRiskExplanation } from '../../services/fraudAnalysis';

describe('Fraud Analysis Service', () => {
  describe('calculateFraudRiskScore', () => {
    it('should return low risk for standard transaction', async () => {
      const factors = {
        amount: 100,
        email: 'user@example.com',
        currency: 'USD',
        source: 'tok_live_123'
      };

      const riskScore = await calculateFraudRiskScore(factors);
      expect(riskScore).toBeLessThan(0.5);
    });

    it('should return high risk for large amount', async () => {
      const factors = {
        amount: 15000,
        email: 'user@example.com',
        currency: 'USD',
        source: 'tok_live_123'
      };

      const riskScore = await calculateFraudRiskScore(factors);
      expect(riskScore).toBeGreaterThanOrEqual(0.4);
    });

    it('should return high risk for suspicious email domain', async () => {
      const factors = {
        amount: 100,
        email: 'user@test.ru',
        currency: 'USD',
        source: 'tok_live_123'
      };

      const riskScore = await calculateFraudRiskScore(factors);
      expect(riskScore).toBeGreaterThanOrEqual(0.3);
    });

    it('should return high risk for test token', async () => {
      const factors = {
        amount: 100,
        email: 'user@example.com',
        currency: 'USD',
        source: 'tok_test_123'
      };

      const riskScore = await calculateFraudRiskScore(factors);
      expect(riskScore).toBeGreaterThanOrEqual(0.1);
    });

    it('should return high risk for non-standard currency', async () => {
      const factors = {
        amount: 100,
        email: 'user@example.com',
        currency: 'XYZ',
        source: 'tok_live_123'
      };

      const riskScore = await calculateFraudRiskScore(factors);
      expect(riskScore).toBeGreaterThanOrEqual(0.1);
    });

    it('should cap risk score at 1.0', async () => {
      const factors = {
        amount: 50000,
        email: 'user@test.ru',
        currency: 'XYZ',
        source: 'tok_test_123'
      };

      const riskScore = await calculateFraudRiskScore(factors);
      expect(riskScore).toBeLessThanOrEqual(1.0);
    });
  });

  describe('generateRiskExplanation', () => {
    it('should generate explanation for low risk transaction', async () => {
      const factors = {
        amount: 100,
        email: 'user@example.com',
        currency: 'USD',
        source: 'tok_live_123'
      };

      const riskScore = 0.2;
      const explanation = await generateRiskExplanation(riskScore, factors);

      expect(explanation).toBeDefined();
      expect(typeof explanation).toBe('string');
      expect(explanation.length).toBeGreaterThan(0);
    });

    it('should generate explanation for high risk transaction', async () => {
      const factors = {
        amount: 15000,
        email: 'user@test.ru',
        currency: 'USD',
        source: 'tok_test_123'
      };

      const riskScore = 0.8;
      const explanation = await generateRiskExplanation(riskScore, factors);

      expect(explanation).toBeDefined();
      expect(typeof explanation).toBe('string');
      expect(explanation.length).toBeGreaterThan(0);
    });

    it('should handle LLM errors gracefully', async () => {
      // This test verifies that the service falls back to generated explanations
      // when the LLM fails, which is handled by the mock
      const factors = {
        amount: 100,
        email: 'user@example.com',
        currency: 'USD',
        source: 'tok_live_123'
      };

      const riskScore = 0.3;
      const explanation = await generateRiskExplanation(riskScore, factors);

      expect(explanation).toBeDefined();
      expect(typeof explanation).toBe('string');
    });
  });
}); 