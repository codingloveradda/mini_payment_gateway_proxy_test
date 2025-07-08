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
const transactions_1 = __importDefault(require("../../routes/transactions"));
// Create a test app
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use('/transactions', transactions_1.default);
describe('Transactions Route', () => {
    describe('GET /transactions', () => {
        it('should return transactions with pagination', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .get('/transactions')
                .expect(200);
            expect(response.body).toHaveProperty('transactions');
            expect(response.body).toHaveProperty('pagination');
            expect(response.body).toHaveProperty('stats');
            expect(response.body).toHaveProperty('cache');
            expect(Array.isArray(response.body.transactions)).toBe(true);
            expect(response.body.pagination).toHaveProperty('total');
            expect(response.body.pagination).toHaveProperty('limit');
            expect(response.body.pagination).toHaveProperty('offset');
            expect(response.body.pagination).toHaveProperty('hasMore');
            expect(response.body.stats).toHaveProperty('total');
            expect(response.body.stats).toHaveProperty('successful');
            expect(response.body.stats).toHaveProperty('blocked');
            expect(response.body.stats).toHaveProperty('averageRiskScore');
            expect(response.body.stats).toHaveProperty('totalAmount');
            expect(response.body.cache).toHaveProperty('size');
            expect(response.body.cache).toHaveProperty('maxSize');
            expect(response.body.cache).toHaveProperty('hitRate');
            expect(response.body.cache).toHaveProperty('totalHits');
            expect(response.body.cache).toHaveProperty('totalMisses');
        }));
        it('should handle status filtering', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .get('/transactions?status=success')
                .expect(200);
            expect(response.body.transactions).toBeDefined();
            expect(Array.isArray(response.body.transactions)).toBe(true);
        }));
        it('should handle pagination parameters', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .get('/transactions?limit=10&offset=0')
                .expect(200);
            expect(response.body.pagination.limit).toBe(10);
            expect(response.body.pagination.offset).toBe(0);
        }));
        it('should handle invalid status parameter', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .get('/transactions?status=invalid')
                .expect(200);
            // Should return all transactions when status is invalid
            expect(response.body.transactions).toBeDefined();
        }));
        it('should handle invalid pagination parameters', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .get('/transactions?limit=invalid&offset=invalid')
                .expect(200);
            // Should use default values for invalid parameters
            expect(response.body.pagination.limit).toBe(50);
            expect(response.body.pagination.offset).toBe(0);
        }));
        it('should return cache statistics', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .get('/transactions')
                .expect(200);
            const cache = response.body.cache;
            expect(cache.size).toBeGreaterThanOrEqual(0);
            expect(cache.maxSize).toBe(1000);
            expect(cache.hitRate).toBeGreaterThanOrEqual(0);
            expect(cache.hitRate).toBeLessThanOrEqual(1);
            expect(cache.totalHits).toBeGreaterThanOrEqual(0);
            expect(cache.totalMisses).toBeGreaterThanOrEqual(0);
        }));
    });
});
