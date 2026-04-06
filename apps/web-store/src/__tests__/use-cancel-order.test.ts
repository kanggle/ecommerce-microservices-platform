import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import React from 'react';

const mockCancelOrder = vi.fn();

vi.mock('@/entities/order', () => ({
  cancelOrder: (...args: unknown[]) => mockCancelOrder(...args),
}));

import { useCancelOrder } from '@/features/order/model/use-cancel-order';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
}

describe('useCancelOrder', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('주문 취소를 성공적으로 수행한다', async () => {
    const response = { orderId: 'order-1', status: 'CANCELLED' };
    mockCancelOrder.mockResolvedValueOnce(response);

    const { result } = renderHook(() => useCancelOrder(), { wrapper: createWrapper() });

    act(() => {
      result.current.mutate('order-1');
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockCancelOrder).toHaveBeenCalledWith('order-1');
    expect(result.current.data).toEqual(response);
  });

  it('주문 취소 실패 시 에러 상태를 반환한다', async () => {
    mockCancelOrder.mockRejectedValueOnce(new Error('Cancel failed'));

    const { result } = renderHook(() => useCancelOrder(), { wrapper: createWrapper() });

    act(() => {
      result.current.mutate('order-1');
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeInstanceOf(Error);
  });

  it('초기 상태에서 idle 상태이다', () => {
    const { result } = renderHook(() => useCancelOrder(), { wrapper: createWrapper() });

    expect(result.current.isPending).toBe(false);
    expect(result.current.isSuccess).toBe(false);
    expect(result.current.isError).toBe(false);
  });

  it('성공 시 관련 쿼리를 무효화한다', async () => {
    mockCancelOrder.mockResolvedValueOnce({ orderId: 'order-1', status: 'CANCELLED' });

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const wrapper = ({ children }: { children: ReactNode }) =>
      React.createElement(QueryClientProvider, { client: queryClient }, children);

    const { result } = renderHook(() => useCancelOrder(), { wrapper });

    act(() => {
      result.current.mutate('order-1');
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ['orders', 'detail', 'order-1'],
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ['orders', 'list'],
    });
  });
});
