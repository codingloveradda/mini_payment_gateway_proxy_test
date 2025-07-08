export interface TransactionLog {
  id: string;
  timestamp: Date;
  amount: number;
  currency: string;
  email: string;
  source: string;
  riskScore: number;
  status: 'success' | 'blocked';
  provider?: string;
  transactionId?: string;
  explanation: string;
  metadata: {
    userAgent?: string;
    ipAddress?: string;
    processingTime: number;
  };
}

class TransactionLogger {
  private transactions: TransactionLog[] = [];

  logTransaction(
    amount: number,
    currency: string,
    email: string,
    source: string,
    riskScore: number,
    status: 'success' | 'blocked',
    provider: string | null,
    transactionId: string | null,
    explanation: string,
    metadata: {
      userAgent?: string;
      ipAddress?: string;
      processingTime: number;
    }
  ): void {
    const transaction: TransactionLog = {
      id: this.generateTransactionId(),
      timestamp: new Date(),
      amount,
      currency,
      email,
      source,
      riskScore,
      status,
      provider: provider || undefined,
      transactionId: transactionId || undefined,
      explanation,
      metadata
    };

    this.transactions.push(transaction);
    
    // Keep only last 1000 transactions to prevent memory issues
    if (this.transactions.length > 1000) {
      this.transactions = this.transactions.slice(-1000);
    }
  }

  getAllTransactions(): TransactionLog[] {
    return [...this.transactions].reverse(); // Most recent first
  }

  getTransactionsByStatus(status: 'success' | 'blocked'): TransactionLog[] {
    return this.transactions
      .filter(t => t.status === status)
      .reverse();
  }

  getTransactionsByDateRange(startDate: Date, endDate: Date): TransactionLog[] {
    return this.transactions
      .filter(t => t.timestamp >= startDate && t.timestamp <= endDate)
      .reverse();
  }

  getTransactionStats(): {
    total: number;
    successful: number;
    blocked: number;
    averageRiskScore: number;
    totalAmount: number;
  } {
    const total = this.transactions.length;
    const successful = this.transactions.filter(t => t.status === 'success').length;
    const blocked = this.transactions.filter(t => t.status === 'blocked').length;
    const averageRiskScore = this.transactions.length > 0 
      ? this.transactions.reduce((sum, t) => sum + t.riskScore, 0) / this.transactions.length 
      : 0;
    const totalAmount = this.transactions
      .filter(t => t.status === 'success')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      total,
      successful,
      blocked,
      averageRiskScore: parseFloat(averageRiskScore.toFixed(3)),
      totalAmount
    };
  }

  private generateTransactionId(): string {
    return `log_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  }
}

export const transactionLogger = new TransactionLogger(); 