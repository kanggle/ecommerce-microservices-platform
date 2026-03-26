import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import { useCancelOrder } from '@/features/order-management/hooks/use-cancel-order';

const mockCancelOrder = vi.fn().mockResolvedValue({ orderId: 'o1', status: 'CANCELLED' });

vi.mock('@/features/order-management/api/order-api', () => ({
  cancelOrder: (...args: unknown[]) => mockCancelOrder(...args),
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
}

describe('useCancelOrder', () => {
  beforeEach(() => {
    mockCancelOrder.mockClear();
  });

  it('주문을 취소한다', async () => {
    const { result } = renderHook(() => useCancelOrder(), {
      wrapper: createWrapper(),
    });

    result.current.mutate('o1');

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockCancelOrder).toHaveBeenCalledWith('o1');
  });

  it('취소 실패 시 에러 상태가 된다', async () => {
    mockCancelOrder.mockRejectedValueOnce(new Error('ORDER_CANNOT_BE_CANCELLED'));

    const { result } = renderHook(() => useCancelOrder(), {
      wrapper: createWrapper(),
    });

    result.current.mutate('o1');

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });

  it('취소 실패 시 alert로 에러 메시지를 표시한다', async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    mockCancelOrder.mockRejectedValueOnce({
      code: 'ORDER_CANNOT_BE_CANCELLED',
      message: '주문을 취소할 수 없는 상태입니다.',
      timestamp: '2026-03-25T00:00:00Z',
    });

    const { result } = renderHook(() => useCancelOrder(), {
      wrapper: createWrapper(),
    });

    result.current.mutate('o1');

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(alertSpy).toHaveBeenCalledWith('주문을 취소할 수 없는 상태입니다.');
    alertSpy.mockRestore();
  });
});
