import { useEffect, useState } from 'react';
import type { OrderDetail, PaymentResponse } from '@repo/types';
import { isApiError } from '@repo/types/guards';
import { getOrder, cancelOrder } from '@/entities/order';
import { getPayment } from '@/entities/payment';

export const CANCELLABLE_STATUSES = new Set(['PENDING', 'CONFIRMED']);

export interface UseOrderDetailReturn {
  order: OrderDetail | null;
  payment: PaymentResponse | null;
  paymentError: string;
  isLoading: boolean;
  error: string;
  isCancelling: boolean;
  handleCancel: () => Promise<void>;
  retryLoad: () => void;
}

export function useOrderDetail(orderId: string): UseOrderDetailReturn {
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [payment, setPayment] = useState<PaymentResponse | null>(null);
  const [paymentError, setPaymentError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    if (orderId) {
      loadOrder(orderId);
    }
  }, [orderId]);

  async function loadOrder(id: string) {
    setIsLoading(true);
    setError('');
    try {
      const result = await getOrder(id);
      setOrder(result);
      loadPayment(id);
    } catch (err) {
      if (isApiError(err) && err.code === 'ORDER_NOT_FOUND') {
        setError('주문을 찾을 수 없습니다.');
      } else {
        setError('주문 정보를 불러오는데 실패했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function loadPayment(id: string) {
    setPaymentError('');
    try {
      const result = await getPayment(id);
      setPayment(result);
    } catch (err) {
      setPayment(null);
      if (isApiError(err) && err.code === 'PAYMENT_NOT_FOUND') {
        return;
      }
      setPaymentError('결제 정보를 불러오는데 실패했습니다.');
    }
  }

  async function handleCancel() {
    if (!order || isCancelling) return;
    setIsCancelling(true);
    try {
      await cancelOrder(order.orderId);
      setOrder({ ...order, status: 'CANCELLED' });
    } catch (err) {
      if (isApiError(err)) {
        setError(err.message ?? '주문 취소에 실패했습니다.');
      } else {
        setError('주문 취소에 실패했습니다.');
      }
    } finally {
      setIsCancelling(false);
    }
  }

  function retryLoad() {
    loadOrder(orderId);
  }

  return {
    order,
    payment,
    paymentError,
    isLoading,
    error,
    isCancelling,
    handleCancel,
    retryLoad,
  };
}
