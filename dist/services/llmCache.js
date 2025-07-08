"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.llmCache = void 0;
class LLMCache {
    constructor() {
        this.cache = new Map();
        this.DEFAULT_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
        this.MAX_CACHE_SIZE = 1000;
        this.totalHits = 0;
        this.totalMisses = 0;
    }
    generateCacheKey(factors) {
        // Create a normalized cache key based on risk factors
        const normalizedAmount = this.normalizeAmount(factors.amount);
        const normalizedEmail = this.normalizeEmail(factors.email);
        const normalizedRiskScore = this.normalizeRiskScore(factors.riskScore);
        return `${normalizedAmount}_${normalizedEmail}_${factors.currency}_${factors.source}_${normalizedRiskScore}`;
    }
    normalizeAmount(amount) {
        // Group amounts into ranges for better cache hits
        if (amount <= 100)
            return 'low';
        if (amount <= 500)
            return 'medium';
        if (amount <= 1000)
            return 'high';
        if (amount <= 5000)
            return 'very_high';
        return 'extreme';
    }
    normalizeEmail(email) {
        var _a;
        const domain = ((_a = email.split('@')[1]) === null || _a === void 0 ? void 0 : _a.toLowerCase()) || '';
        // Normalize email domains for better cache hits
        if (domain.endsWith('.ru'))
            return 'high_risk_domain';
        if (domain.endsWith('.test.com'))
            return 'test_domain';
        if (domain.endsWith('.demo.com'))
            return 'demo_domain';
        if (domain.includes('test'))
            return 'test_related';
        if (domain.includes('temp'))
            return 'temp_related';
        return 'standard_domain';
    }
    normalizeRiskScore(riskScore) {
        // Group risk scores into ranges
        if (riskScore < 0.2)
            return 'very_low';
        if (riskScore < 0.4)
            return 'low';
        if (riskScore < 0.6)
            return 'medium';
        if (riskScore < 0.8)
            return 'high';
        return 'very_high';
    }
    get(key) {
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
    set(key, explanation, ttl = this.DEFAULT_TTL) {
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
    cleanup() {
        const now = Date.now();
        for (const [key, entry] of this.cache.entries()) {
            if (now > entry.timestamp + entry.ttl) {
                this.cache.delete(key);
            }
        }
    }
    getStats() {
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
    recordHit() {
        this.totalHits++;
    }
    recordMiss() {
        this.totalMisses++;
    }
    clear() {
        this.cache.clear();
        this.totalHits = 0;
        this.totalMisses = 0;
    }
}
exports.llmCache = new LLMCache();
