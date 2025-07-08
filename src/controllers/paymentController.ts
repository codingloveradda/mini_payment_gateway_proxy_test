type PaymentRequest = {
  amount: number;
  currency: string;
  source: string;
  email?: string;
};

export async function processStripePayment(payment: PaymentRequest) {
  // Simulate processing delay
  await new Promise((resolve) => setTimeout(resolve, 100));
  return {
    status: 'success',
    message: 'Processed by Stripe',
    transactionId: 'stripe_' + Date.now(),
  };
}

export async function processPayPalPayment(payment: PaymentRequest) {
  // Simulate processing delay
  await new Promise((resolve) => setTimeout(resolve, 100));
  return {
    status: 'success',
    message: 'Processed by PayPal',
    transactionId: 'paypal_' + Date.now(),
  };
} 