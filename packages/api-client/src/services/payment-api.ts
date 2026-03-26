import type { ApiClient } from '../client';
import type { PaymentResponse } from '@repo/types';

export function createPaymentApi(client: ApiClient) {
  return {
    getPayment: (orderId: string) =>
      client.get<PaymentResponse>(`/api/payments/orders/${orderId}`),
  };
}
