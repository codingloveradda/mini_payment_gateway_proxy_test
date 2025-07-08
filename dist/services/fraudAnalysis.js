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
exports.calculateFraudRiskScore = calculateFraudRiskScore;
exports.generateRiskExplanation = generateRiskExplanation;
const openai_1 = require("openai");
const llmCache_1 = require("./llmCache");
const openai = new openai_1.OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'sk-demo-key',
});
function calculateFraudRiskScore(factors) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        let riskScore = 0.0;
        // Amount-based risk
        if (factors.amount > 10000)
            riskScore += 0.4;
        else if (factors.amount > 5000)
            riskScore += 0.3;
        else if (factors.amount > 1000)
            riskScore += 0.2;
        else if (factors.amount > 500)
            riskScore += 0.1;
        // Email domain risk
        const emailDomain = (_a = factors.email.split('@')[1]) === null || _a === void 0 ? void 0 : _a.toLowerCase();
        if (emailDomain) {
            if (emailDomain.endsWith('.ru'))
                riskScore += 0.3;
            else if (emailDomain.endsWith('.test.com'))
                riskScore += 0.2;
            else if (emailDomain.endsWith('.demo.com'))
                riskScore += 0.15;
            else if (emailDomain.includes('test'))
                riskScore += 0.1;
            else if (emailDomain.includes('temp'))
                riskScore += 0.1;
        }
        // Source token risk
        if (factors.source.includes('tok_test'))
            riskScore += 0.1;
        // Currency risk (non-standard currencies)
        if (!['USD', 'EUR', 'GBP', 'CAD', 'AUD'].includes(factors.currency.toUpperCase())) {
            riskScore += 0.1;
        }
        return Math.min(riskScore, 1.0); // Cap at 1.0
    });
}
function generateRiskExplanation(riskScore, factors) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        // Generate cache key based on normalized factors
        const cacheKey = llmCache_1.llmCache.generateCacheKey(Object.assign(Object.assign({}, factors), { riskScore }));
        // Try to get cached explanation first
        const cachedExplanation = llmCache_1.llmCache.get(cacheKey);
        if (cachedExplanation) {
            llmCache_1.llmCache.recordHit();
            return cachedExplanation;
        }
        llmCache_1.llmCache.recordMiss();
        try {
            const riskFactors = identifyRiskFactors(factors);
            const isBlocked = riskScore >= 0.5;
            const prompt = `As a fraud detection expert, provide a natural, conversational explanation of this payment transaction's risk assessment.

Transaction Details:
- Amount: ${factors.currency} ${factors.amount.toLocaleString()}
- Email: ${factors.email}
- Payment Source: ${factors.source}
- Risk Score: ${riskScore.toFixed(2)} (0.0 = safe, 1.0 = high risk)

Risk Factors Detected:
${riskFactors.map(factor => `- ${factor}`).join('\n')}

Action: ${isBlocked ? 'BLOCKED' : 'APPROVED'}

Please provide a natural, conversational explanation that:
1. Explains the risk assessment in plain language
2. Mentions specific risk factors that contributed to the score
3. Explains the decision (approved/blocked) in a user-friendly way
4. Uses a professional but approachable tone

Keep it to 2-3 sentences maximum.`;
            const completion = yield openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: "You are a helpful fraud detection expert. Provide clear, natural explanations of risk assessments in conversational language. Be professional but approachable."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                max_tokens: 150,
                temperature: 0.4,
            });
            const explanation = ((_b = (_a = completion.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content) ||
                generateFallbackExplanation(riskScore, factors);
            // Cache the explanation for future similar requests
            llmCache_1.llmCache.set(cacheKey, explanation);
            return explanation;
        }
        catch (error) {
            console.error('LLM error:', error);
            const fallbackExplanation = generateFallbackExplanation(riskScore, factors);
            // Cache the fallback explanation as well
            llmCache_1.llmCache.set(cacheKey, fallbackExplanation);
            return fallbackExplanation;
        }
    });
}
function identifyRiskFactors(factors) {
    var _a;
    const riskFactors = [];
    // Amount-based factors
    if (factors.amount > 10000) {
        riskFactors.push(`High transaction amount (${factors.currency} ${factors.amount.toLocaleString()})`);
    }
    else if (factors.amount > 5000) {
        riskFactors.push(`Large transaction amount (${factors.currency} ${factors.amount.toLocaleString()})`);
    }
    else if (factors.amount > 1000) {
        riskFactors.push(`Moderate transaction amount (${factors.currency} ${factors.amount.toLocaleString()})`);
    }
    // Email domain factors
    const emailDomain = (_a = factors.email.split('@')[1]) === null || _a === void 0 ? void 0 : _a.toLowerCase();
    if (emailDomain) {
        if (emailDomain.endsWith('.ru')) {
            riskFactors.push(`Email from high-risk domain (.ru)`);
        }
        else if (emailDomain.endsWith('test.com')) {
            riskFactors.push(`Test email domain detected`);
        }
        else if (emailDomain.endsWith('demo.com')) {
            riskFactors.push(`Demo email domain detected`);
        }
        else if (emailDomain.includes('test')) {
            riskFactors.push(`Email contains test-related terms`);
        }
    }
    // Payment source factors
    if (factors.source.includes('tok_test')) {
        riskFactors.push(`Test payment token used`);
    }
    // Currency factors
    if (!['USD', 'EUR', 'GBP', 'CAD', 'AUD'].includes(factors.currency.toUpperCase())) {
        riskFactors.push(`Non-standard currency (${factors.currency})`);
    }
    return riskFactors.length > 0 ? riskFactors : ['Standard transaction characteristics'];
}
function generateFallbackExplanation(riskScore, factors) {
    const riskFactors = identifyRiskFactors(factors);
    const isBlocked = riskScore >= 0.5;
    if (isBlocked) {
        return `This transaction has been flagged as high risk (${riskScore.toFixed(2)}) due to ${riskFactors.join(', ')}. For your security, this payment has been blocked.`;
    }
    else {
        return `This transaction appears to be legitimate with a low risk score (${riskScore.toFixed(2)}). The payment has been approved for processing.`;
    }
}
