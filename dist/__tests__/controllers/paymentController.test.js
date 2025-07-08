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
const paymentController_1 = require("../../controllers/paymentController");
describe('Payment Controller', () => {
    describe('processStripePayment', () => {
        it('should process Stripe payment successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            const paymentRequest = {
                amount: 1000,
                currency: 'USD',
                source: 'tok_live_123'
            };
            const result = yield (0, paymentController_1.processStripePayment)(paymentRequest);
            expect(result).toHaveProperty('status');
            expect(result).toHaveProperty('message');
            expect(result).toHaveProperty('transactionId');
            expect(result.status).toBe('success');
            expect(result.message).toBe('Processed by Stripe');
            expect(result.transactionId).toMatch(/^stripe_\d+$/);
        }));
        it('should handle different currencies', () => __awaiter(void 0, void 0, void 0, function* () {
            const paymentRequest = {
                amount: 500,
                currency: 'EUR',
                source: 'tok_live_456'
            };
            const result = yield (0, paymentController_1.processStripePayment)(paymentRequest);
            expect(result.status).toBe('success');
            expect(result.message).toBe('Processed by Stripe');
        }));
        it('should generate unique transaction IDs', () => __awaiter(void 0, void 0, void 0, function* () {
            const paymentRequest = {
                amount: 100,
                currency: 'USD',
                source: 'tok_live_123'
            };
            const result1 = yield (0, paymentController_1.processStripePayment)(paymentRequest);
            const result2 = yield (0, paymentController_1.processStripePayment)(paymentRequest);
            expect(result1.transactionId).not.toBe(result2.transactionId);
        }));
    });
    describe('processPayPalPayment', () => {
        it('should process PayPal payment successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            const paymentRequest = {
                amount: 1000,
                currency: 'USD',
                source: 'paypal_token_123'
            };
            const result = yield (0, paymentController_1.processPayPalPayment)(paymentRequest);
            expect(result).toHaveProperty('status');
            expect(result).toHaveProperty('message');
            expect(result).toHaveProperty('transactionId');
            expect(result.status).toBe('success');
            expect(result.message).toBe('Processed by PayPal');
            expect(result.transactionId).toMatch(/^paypal_\d+$/);
        }));
        it('should handle different currencies', () => __awaiter(void 0, void 0, void 0, function* () {
            const paymentRequest = {
                amount: 500,
                currency: 'GBP',
                source: 'paypal_token_456'
            };
            const result = yield (0, paymentController_1.processPayPalPayment)(paymentRequest);
            expect(result.status).toBe('success');
            expect(result.message).toBe('Processed by PayPal');
        }));
        it('should generate unique transaction IDs', () => __awaiter(void 0, void 0, void 0, function* () {
            const paymentRequest = {
                amount: 100,
                currency: 'USD',
                source: 'paypal_token_123'
            };
            const result1 = yield (0, paymentController_1.processPayPalPayment)(paymentRequest);
            const result2 = yield (0, paymentController_1.processPayPalPayment)(paymentRequest);
            expect(result1.transactionId).not.toBe(result2.transactionId);
        }));
    });
    describe('Payment Request Interface', () => {
        it('should accept valid payment requests', () => __awaiter(void 0, void 0, void 0, function* () {
            const validRequests = [
                { amount: 100, currency: 'USD', source: 'tok_live_123' },
                { amount: 1000, currency: 'EUR', source: 'paypal_token_456' },
                { amount: 50, currency: 'GBP', source: 'tok_test_789' }
            ];
            for (const request of validRequests) {
                const result = yield (0, paymentController_1.processStripePayment)(request);
                expect(result.status).toBe('success');
            }
        }));
    });
});
