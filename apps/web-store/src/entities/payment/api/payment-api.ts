import { apiClient } from '@/shared/config/api';
import { createPaymentApi } from '@repo/api-client';
import type { PaymentResponse } from '@repo/types';

const paymentApi = createPaymentApi(apiClient);

export async function getPayment(orderId: string): Promise<PaymentResponse> {
  return paymentApi.getPayment(orderId);
}
