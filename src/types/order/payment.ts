/**
 * Payment Types
 * 
 * Payment and transaction types.
 */

import type { PaymentStatus, PaymentMethod } from './order';

export interface Transaction {
  id: string;
  orderId: string;
  amount: number;
  transactionType: 'payment' | 'refund' | 'adjustment';
  paymentMethod: PaymentMethod;
  paymentGateway?: string;
  gatewayTransactionId?: string;
  status: PaymentStatus;
  description?: string;
  createdAt: Date;
  processedAt?: Date;
  refundedAmount: number;
}

// Re-export for convenience
export type { PaymentStatus, PaymentMethod };