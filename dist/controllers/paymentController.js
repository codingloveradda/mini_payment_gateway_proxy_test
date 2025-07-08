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
exports.processStripePayment = processStripePayment;
exports.processPayPalPayment = processPayPalPayment;
function processStripePayment(payment) {
    return __awaiter(this, void 0, void 0, function* () {
        // Simulate processing delay
        yield new Promise((resolve) => setTimeout(resolve, 100));
        return {
            status: 'success',
            message: 'Processed by Stripe',
            transactionId: 'stripe_' + Date.now(),
        };
    });
}
function processPayPalPayment(payment) {
    return __awaiter(this, void 0, void 0, function* () {
        // Simulate processing delay
        yield new Promise((resolve) => setTimeout(resolve, 100));
        return {
            status: 'success',
            message: 'Processed by PayPal',
            transactionId: 'paypal_' + Date.now(),
        };
    });
}
