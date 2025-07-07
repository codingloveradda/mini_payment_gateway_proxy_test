# Node.js Express TypeScript Starter

This project is a modern Node.js and Express.js starter using TypeScript with advanced fraud detection capabilities.

## Features

- **Fraud Risk Analysis**: Sophisticated risk scoring based on transaction amount, email domain, and payment source
- **LLM-Powered Explanations**: Uses OpenAI GPT to generate human-readable explanations of risk assessments
- **Smart Payment Routing**: Routes low-risk transactions to payment processor, blocks high-risk transactions
- **Transaction Logging**: In-memory transaction logging with timestamps and metadata
- **LLM Caching**: Intelligent caching of LLM responses for improved performance
- **Comprehensive Testing**: Full unit and integration test coverage
- **TypeScript**: Full type safety and modern development experience

## Getting Started

### Install dependencies

```
npm install
```

### Environment Setup

Create a `.env` file in the root directory:

```
OPENAI_API_KEY=your_openai_api_key_here
PORT=3000
```

### Development mode

```
npm run dev
```

### Build for production

```
npm run build
```

### Start production server

```
npm start
```

## Testing

### Run all tests

```
npm test
```

### Run tests in watch mode

```
npm run test:watch
```

### Run tests with coverage

```
npm run test:coverage
```

### Run tests for CI

```
npm run test:ci
```

### Test Coverage

The project includes comprehensive test coverage for:

- **Fraud Analysis Service**: Risk scoring and LLM explanation generation
- **LLM Cache Service**: Caching functionality and performance
- **Transaction Logger**: Transaction logging and statistics
- **Payment Controller**: Payment processing simulation
- **API Routes**: Integration tests for /charge and /transactions endpoints

## API Endpoints

### POST /charge

Process a payment with fraud risk assessment.

**Request Body:**
```json
{
  "amount": 1000,
  "currency": "USD", 
  "source": "tok_test",
  "email": "donor@demo.com"
}
```

**Success Response (Low Risk):**
```json
{
  "transactionId": "stripe_1751864585511",
  "provider": "stripe",
  "status": "success",
  "riskScore": 0.42,
  "explanation": "Transaction processed with moderate risk assessment."
}
```

**Blocked Response (High Risk):**
```json
{
  "transactionId": null,
  "provider": null,
  "status": "blocked",
  "riskScore": 0.75,
  "explanation": "Transaction blocked due to high fraud risk. The transaction was flagged due to suspicious email domain and large amount."
}
```

### GET /transactions

Retrieve transaction logs with optional filtering and pagination.

**Query Parameters:**
- `status` (optional): Filter by status (`success` or `blocked`)
- `limit` (optional): Number of transactions to return (default: 50)
- `offset` (optional): Number of transactions to skip (default: 0)

**Response:**
```json
{
  "transactions": [
    {
      "id": "log_1751864585511_abc123",
      "timestamp": "2024-01-15T10:30:45.123Z",
      "amount": 1000,
      "currency": "USD",
      "email": "donor@demo.com",
      "source": "tok_test",
      "riskScore": 0.42,
      "status": "success",
      "provider": "stripe",
      "transactionId": "stripe_1751864585511",
      "explanation": "Transaction processed with moderate risk assessment.",
      "metadata": {
        "userAgent": "Mozilla/5.0...",
        "ipAddress": "192.168.1.1",
        "processingTime": 245
      }
    }
  ],
  "pagination": {
    "total": 150,
    "limit": 50,
    "offset": 0,
    "hasMore": true
  },
  "stats": {
    "total": 150,
    "successful": 120,
    "blocked": 30,
    "averageRiskScore": 0.325,
    "totalAmount": 125000
  },
  "cache": {
    "size": 45,
    "maxSize": 1000,
    "hitRate": 0.78,
    "totalHits": 156,
    "totalMisses": 44
  }
}
```

## Fraud Risk Factors

The system evaluates risk based on:

- **Transaction Amount**: Higher amounts increase risk
- **Email Domain**: Suspicious domains (.ru, test.com, demo.com) increase risk
- **Payment Source**: Test tokens increase risk
- **Currency**: Non-standard currencies increase risk

## Risk Assessment Logic

- **Score < 0.5**: Transaction processed through payment processor
- **Score ≥ 0.5**: Transaction blocked with 403 status

## LLM Caching System

The system includes intelligent caching for LLM responses to improve performance:

### **Cache Features:**
- **Normalized Keys**: Groups similar transactions into cache buckets
- **Amount Ranges**: Low, medium, high, very high, extreme
- **Email Domains**: Standard, test-related, high-risk, demo domains
- **Risk Score Ranges**: Very low, low, medium, high, very high
- **TTL**: 24-hour cache expiration
- **Size Limit**: Maximum 1000 cached entries
- **Automatic Cleanup**: Removes expired entries

### **Cache Statistics:**
- **Hit Rate**: Percentage of cache hits vs misses
- **Total Hits/Misses**: Raw cache performance metrics
- **Current Size**: Number of cached entries
- **Performance Monitoring**: Available via GET /transactions endpoint

### **Performance Benefits:**
- **Reduced API Calls**: Similar transactions use cached explanations
- **Faster Response Times**: Cached responses return instantly
- **Cost Savings**: Fewer OpenAI API calls
- **Consistent Explanations**: Similar transactions get consistent explanations

## Transaction Logging

All transactions are logged in memory with:
- Timestamp and unique ID
- Transaction details (amount, currency, email, source)
- Risk score and status
- LLM-generated explanation (cached when possible)
- Metadata (user agent, IP address, processing time)
- Automatic cleanup (keeps last 1000 transactions)

## Project Structure

- `src/app.ts` - Main entry point
- `src/routes/` - Express route definitions
- `src/controllers/` - Route handler logic
- `src/services/` - Business logic including fraud analysis, transaction logging, and LLM caching
- `src/middleware/` - Custom Express middleware
- `src/types/` - Custom TypeScript type definitions
- `src/__tests__/` - Comprehensive test suite # mini_payment_gateway_proxy_test
