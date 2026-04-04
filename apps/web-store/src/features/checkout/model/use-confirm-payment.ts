import { useMutation } from '@tanstack/react-query';
import { confirmPayment } from '@/entities/payment';

interface ConfirmPaymentParams {
  paymentKey: string;
  orderId: string;
  amount: number;
}

export function useConfirmPayment() {
  return useMutation({
    mutationFn: (params: ConfirmPaymentParams) => confirmPayment(params),
  });
}
