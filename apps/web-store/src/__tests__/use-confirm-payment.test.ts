import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import React from 'react';

const mockConfirmPayment = vi.fn();

vi.mock('@/entities/payment', () => ({
  confirmPayment: (...args: unknown[]) => mockConfirmPayment(...args),
}));

import { useConfirmPayment } from '@/features/checkout/model/use-confirm-payment';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
}

describe('useConfirmPayment', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('결제 승인을 성공적으로 수행한다', async () => {
    const response = { orderId: 'order-1', status: 'DONE' };
    mockConfirmPayment.mockResolvedValueOnce(response);

    const { result } = renderHook(() => useConfirmPayment(), { wrapper: createWrapper() });

    act(() => {
      result.current.mutate({
        paymentKey: 'pk_test_123',
        orderId: 'order-1',
        amount: 50000,
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockConfirmPayment).toHaveBeenCalledWith({
      paymentKey: 'pk_test_123',
      orderId: 'order-1',
      amount: 50000,
    });
    expect(result.current.data).toEqual(response);
  });

  it('결제 승인 실패 시 에러 상태를 반환한다', async () => {
    mockConfirmPayment.mockRejectedValueOnce(new Error('Payment confirmation failed'));

    const { result } = renderHook(() => useConfirmPayment(), { wrapper: createWrapper() });

    act(() => {
      result.current.mutate({
        paymentKey: 'pk_test_123',
        orderId: 'order-1',
        amount: 50000,
      });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe('Payment confirmation failed');
  });

  it('초기 상태에서 idle 상태이다', () => {
    const { result } = renderHook(() => useConfirmPayment(), { wrapper: createWrapper() });

    expect(result.current.isPending).toBe(false);
    expect(result.current.isSuccess).toBe(false);
    expect(result.current.isError).toBe(false);
  });
});
