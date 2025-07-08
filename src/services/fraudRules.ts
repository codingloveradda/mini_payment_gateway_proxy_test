export const fraudRules = {
  amount: [
    { threshold: 10000, risk: 0.4 },
    { threshold: 5000, risk: 0.3 },
    { threshold: 1000, risk: 0.2 },
    { threshold: 500, risk: 0.1 },
  ],
  emailDomains: [
    { pattern: /.ru$/, risk: 0.3 },
    { pattern: /.test.com$/, risk: 0.2 },
    { pattern: /.demo.com$/, risk: 0.15 },
    { pattern: /test/, risk: 0.1 },
    { pattern: /temp/, risk: 0.1 },
  ],
  sourceTokens: [
    { pattern: /tok_test/, risk: 0.1 },
  ],
  nonStandardCurrencies: {
    list: ['USD', 'EUR', 'GBP', 'CAD', 'AUD'],
    risk: 0.1,
  },
  blockThreshold: 0.5,
}; 