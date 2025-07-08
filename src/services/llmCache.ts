interface CacheEntry {
  explanation: string;
  timestamp: number;
  ttl: number;
}

class LLMCache {
  private cache: Map<string, CacheEntry> = new Map();
  private readonly DEFAULT_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  private readonly MAX_CACHE_SIZE = 1000;

  generateCacheKey(factors: {
    amount: number;
    email: string;
    currency: string;
    source: string;
    riskScore: number;
  }): string {
    // Create a normalized cache key based on risk factors
    const normalizedAmount = this.normalizeAmount(factors.amount);
    const normalizedEmail = this.normalizeEmail(factors.email);
    const normalizedRiskScore = this.normalizeRiskScore(factors.riskScore);
    
    return `${normalizedAmount}_${normalizedEmail}_${factors.currency}_${factors.source}_${normalizedRiskScore}`;
  }

  private normalizeAmount(amount: number): string {
    // Group amounts into ranges for better cache hits
    if (amount <= 100) return 'low';
    if (amount <= 500) return 'medium';
    if (amount <= 1000) return 'high';
    if (amount <= 5000) return 'very_high';
    return 'extreme';
  }

  private normalizeEmail(email: string): string {
    const domain = email.split('@')[1]?.toLowerCase() || '';
    
    // Normalize email domains for better cache hits
    if (domain.endsWith('.ru')) return 'high_risk_domain';
    if (domain.endsWith('.test.com')) return 'test_domain';
    if (domain.endsWith('.demo.com')) return 'demo_domain';
    if (domain.includes('test')) return 'test_related';
    if (domain.includes('temp')) return 'temp_related';
    
    return 'standard_domain';
  }

  private normalizeRiskScore(riskScore: number): string {
    // Group risk scores into ranges
    if (riskScore < 0.2) return 'very_low';
    if (riskScore < 0.4) return 'low';
    if (riskScore < 0.6) return 'medium';
    if (riskScore < 0.8) return 'high';
    return 'very_high';
  }

  get(key: string): string | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if entry has expired
    if (Date.now() > entry.timestamp + entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.explanation;
  }

  set(key: string, explanation: string, ttl: number = this.DEFAULT_TTL): void {
    // Clean up expired entries first
    this.cleanup();
    
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      explanation,
      timestamp: Date.now(),
      ttl
    });
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.timestamp + entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  getStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
    totalHits: number;
    totalMisses: number;
  } {
    return {
      size: this.cache.size,
      maxSize: this.MAX_CACHE_SIZE,
      hitRate: this.totalHits + this.totalMisses > 0 
        ? this.totalHits / (this.totalHits + this.totalMisses) 
        : 0,
      totalHits: this.totalHits,
      totalMisses: this.totalMisses
    };
  }

  private totalHits = 0;
  private totalMisses = 0;

  recordHit(): void {
    this.totalHits++;
  }

  recordMiss(): void {
    this.totalMisses++;
  }

  clear(): void {
    this.cache.clear();
    this.totalHits = 0;
    this.totalMisses = 0;
  }
}

export const llmCache = new LLMCache(); 