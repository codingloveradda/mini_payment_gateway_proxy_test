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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const express_1 = __importDefault(require("express"));
const charge_1 = __importDefault(require("../../routes/charge"));
// Create a test app
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use('/charge', charge_1.default);
describe('Charge Route', () => {
    describe('POST /charge', () => {
        it('should process low-risk transaction successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            const payload = {
                amount: 100,
                currency: 'USD',
                source: 'tok_live_123',
                email: 'user@example.com'
            };
            const response = yield (0, supertest_1.default)(app)
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
        }));
        it('should block high-risk transaction', () => __awaiter(void 0, void 0, void 0, function* () {
            const payload = {
                amount: 15000,
                currency: 'USD',
                source: 'tok_test_123',
                email: 'user@test.ru'
            };
            const response = yield (0, supertest_1.default)(app)
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
        }));
        it('should return 400 for invalid request body', () => __awaiter(void 0, void 0, void 0, function* () {
            const invalidPayloads = [
                { amount: 'invalid', currency: 'USD', source: 'tok_live_123', email: 'user@example.com' },
                { amount: 100, currency: 'USD', source: 'tok_live_123' }, // missing email
                { amount: 100, currency: 'USD', email: 'user@example.com' }, // missing source
                { amount: 100, source: 'tok_live_123', email: 'user@example.com' }, // missing currency
                { currency: 'USD', source: 'tok_live_123', email: 'user@example.com' } // missing amount
            ];
            for (const payload of invalidPayloads) {
                yield (0, supertest_1.default)(app)
                    .post('/charge')
                    .send(payload)
                    .expect(400);
            }
        }));
        it('should handle different currencies', () => __awaiter(void 0, void 0, void 0, function* () {
            const payload = {
                amount: 500,
                currency: 'EUR',
                source: 'tok_live_123',
                email: 'user@example.com'
            };
            const response = yield (0, supertest_1.default)(app)
                .post('/charge')
                .send(payload)
                .expect(200);
            expect(response.body.status).toBe('success');
        }));
        it('should handle test tokens', () => __awaiter(void 0, void 0, void 0, function* () {
            const payload = {
                amount: 100,
                currency: 'USD',
                source: 'tok_test_123',
                email: 'user@example.com'
            };
            const response = yield (0, supertest_1.default)(app)
                .post('/charge')
                .send(payload);
            // Should either be processed (low risk) or blocked (high risk)
            expect([200, 403]).toContain(response.status);
            expect(response.body).toHaveProperty('riskScore');
            expect(response.body).toHaveProperty('explanation');
        }));
        it('should handle suspicious email domains', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
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
        }));
        it('should handle factors', () => __awaiter(void 0, void 0, void 0, function* () {
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
        }));
    });
});
