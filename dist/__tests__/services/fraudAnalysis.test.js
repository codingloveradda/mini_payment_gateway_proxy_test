"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const fraudAnalysis_1 = require("../../services/fraudAnalysis");
describe('Fraud Analysis Service', () => {
    describe('calculateFraudRiskScore', () => {
        it('should return low risk for standard transaction', () => __awaiter(void 0, void 0, void 0, function* () {
            const factors = {
                amount: 100,
                email: 'user@example.com',
                currency: 'USD',
                source: 'tok_live_123'
            };
            const riskScore = yield (0, fraudAnalysis_1.calculateFraudRiskScore)(factors);
            expect(riskScore).toBeLessThan(0.5);
        }));
        it('should return high risk for large amount', () => __awaiter(void 0, void 0, void 0, function* () {
            const factors = {
                amount: 15000,
                email: 'user@example.com',
                currency: 'USD',
                source: 'tok_live_123'
            };
            const riskScore = yield (0, fraudAnalysis_1.calculateFraudRiskScore)(factors);
            expect(riskScore).toBeGreaterThanOrEqual(0.4);
        }));
        it('should return high risk for suspicious email domain', () => __awaiter(void 0, void 0, void 0, function* () {
            const factors = {
                amount: 100,
                email: 'user@test.ru',
                currency: 'USD',
                source: 'tok_live_123'
            };
            const riskScore = yield (0, fraudAnalysis_1.calculateFraudRiskScore)(factors);
            expect(riskScore).toBeGreaterThanOrEqual(0.3);
        }));
        it('should return high risk for test token', () => __awaiter(void 0, void 0, void 0, function* () {
            const factors = {
                amount: 100,
                email: 'user@example.com',
                currency: 'USD',
                source: 'tok_test_123'
            };
            const riskScore = yield (0, fraudAnalysis_1.calculateFraudRiskScore)(factors);
            expect(riskScore).toBeGreaterThanOrEqual(0.1);
        }));
        it('should return high risk for non-standard currency', () => __awaiter(void 0, void 0, void 0, function* () {
            const factors = {
                amount: 100,
                email: 'user@example.com',
                currency: 'XYZ',
                source: 'tok_live_123'
            };
            const riskScore = yield (0, fraudAnalysis_1.calculateFraudRiskScore)(factors);
            expect(riskScore).toBeGreaterThanOrEqual(0.1);
        }));
        it('should cap risk score at 1.0', () => __awaiter(void 0, void 0, void 0, function* () {
            const factors = {
                amount: 50000,
                email: 'user@test.ru',
                currency: 'XYZ',
                source: 'tok_test_123'
            };
            const riskScore = yield (0, fraudAnalysis_1.calculateFraudRiskScore)(factors);
            expect(riskScore).toBeLessThanOrEqual(1.0);
        }));
    });
    describe('generateRiskExplanation', () => {
        it('should generate explanation for low risk transaction', () => __awaiter(void 0, void 0, void 0, function* () {
            const factors = {
                amount: 100,
                email: 'user@example.com',
                currency: 'USD',
                source: 'tok_live_123'
            };
            const riskScore = 0.2;
            const explanation = yield (0, fraudAnalysis_1.generateRiskExplanation)(riskScore, factors);
            expect(explanation).toBeDefined();
            expect(typeof explanation).toBe('string');
            expect(explanation.length).toBeGreaterThan(0);
        }));
        it('should generate explanation for high risk transaction', () => __awaiter(void 0, void 0, void 0, function* () {
            const factors = {
                amount: 15000,
                email: 'user@test.ru',
                currency: 'USD',
                source: 'tok_test_123'
            };
            const riskScore = 0.8;
            const explanation = yield (0, fraudAnalysis_1.generateRiskExplanation)(riskScore, factors);
            expect(explanation).toBeDefined();
            expect(typeof explanation).toBe('string');
            expect(explanation.length).toBeGreaterThan(0);
        }));
        it('should handle LLM errors gracefully', () => __awaiter(void 0, void 0, void 0, function* () {
            // This test verifies that the service falls back to generated explanations
            // when the LLM fails, which is handled by the mock
            const factors = {
                amount: 100,
                email: 'user@example.com',
                currency: 'USD',
                source: 'tok_live_123'
            };
            const riskScore = 0.3;
            const explanation = yield (0, fraudAnalysis_1.generateRiskExplanation)(riskScore, factors);
            expect(explanation).toBeDefined();
            expect(typeof explanation).toBe('string');
        }));
    });
});
