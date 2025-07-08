import { llmCache } from '../../services/llmCache';

describe('LLM Cache Service', () => {
  beforeEach(() => {
    llmCache.clear();
  });

  describe('generateCacheKey', () => {
    it('should generate consistent keys for similar transactions', () => {
      const factors1 = {
        amount: 1200,
        email: 'user@demo.com',
        currency: 'USD',
        source: 'tok_test_123',
        riskScore: 0.3
      };

      const factors2 = {
        amount: 2000,
        email: 'other@demo.com',
        currency: 'USD',
        source: 'tok_test_123',
        riskScore: 0.35
      };

      const key1 = llmCache.generateCacheKey(factors1);
      const key2 = llmCache.generateCacheKey(factors2);

      // Both should be in the same cache bucket due to normalization
      // Both amounts are in the 'very_high' range (1001-5000) and risk scores in 'low' range (0.2-0.4)
      expect(key1).toBe(key2);
    });

    it('should generate different keys for different risk levels', () => {
      const factors1 = {
        amount: 1000,
        email: 'user@example.com',
        currency: 'USD',
        source: 'tok_live_123',
        riskScore: 0.2
      };

      const factors2 = {
        amount: 1000,
        email: 'user@example.com',
        currency: 'USD',
        source: 'tok_live_123',
        riskScore: 0.8
      };

      const key1 = llmCache.generateCacheKey(factors1);
      const key2 = llmCache.generateCacheKey(factors2);

      expect(key1).not.toBe(key2);
    });
  });

  describe('get and set', () => {
    it('should store and retrieve cached explanations', () => {
      const key = 'test_key';
      const explanation = 'Test explanation';

      llmCache.set(key, explanation);
      const retrieved = llmCache.get(key);

      expect(retrieved).toBe(explanation);
    });

    it('should return null for non-existent keys', () => {
      const retrieved = llmCache.get('non_existent_key');
      expect(retrieved).toBeNull();
    });

    it('should handle cache expiration', (done) => {
      const key = 'test_key';
      const explanation = 'Test explanation';

      // Set with very short TTL
      llmCache.set(key, explanation, 1);
      
      // Wait for expiration
      setTimeout(() => {
        const retrieved = llmCache.get(key);
        expect(retrieved).toBeNull();
        done();
      }, 10);
    });
  });

  describe('getStats', () => {
    it('should return correct statistics', () => {
      const stats = llmCache.getStats();

      expect(stats).toHaveProperty('size');
      expect(stats).toHaveProperty('maxSize');
      expect(stats).toHaveProperty('hitRate');
      expect(stats).toHaveProperty('totalHits');
      expect(stats).toHaveProperty('totalMisses');

      expect(stats.size).toBe(0);
      expect(stats.maxSize).toBe(1000);
      expect(stats.hitRate).toBe(0);
      expect(stats.totalHits).toBe(0);
      expect(stats.totalMisses).toBe(0);
    });

    it('should track hits and misses correctly', () => {
      const key = 'test_key';
      const explanation = 'Test explanation';

      // Set a value
      llmCache.set(key, explanation);

      // Get it (should be a hit)
      llmCache.get(key);
      llmCache.recordHit();

      // Try to get non-existent key (should be a miss)
      llmCache.get('non_existent');
      llmCache.recordMiss();

      const stats = llmCache.getStats();

      expect(stats.totalHits).toBe(1);
      expect(stats.totalMisses).toBe(1);
      expect(stats.hitRate).toBe(0.5);
    });
  });

  describe('clear', () => {
    it('should clear all cached data', () => {
      const key = 'test_key';
      const explanation = 'Test explanation';

      llmCache.set(key, explanation);
      llmCache.recordHit();
      llmCache.recordMiss();

      llmCache.clear();

      const stats = llmCache.getStats();
      expect(stats.size).toBe(0);
      expect(stats.totalHits).toBe(0);
      expect(stats.totalMisses).toBe(0);
    });
  });
}); 