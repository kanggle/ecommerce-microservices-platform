// Payment domain types based on specs/contracts/http/payment-api.md

export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

export interface PaymentResponse {
  paymentId: string;
  orderId: string;
  userId: string;
  amount: number;
  status: PaymentStatus;
  createdAt: string;
  paidAt: string | null;
  refundedAt: string | null;
}
