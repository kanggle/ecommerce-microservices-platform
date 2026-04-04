import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { OrderList } from '@/features/order-management/components/OrderList';

const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('@/features/order-management/api/order-api', () => ({
  getOrders: vi.fn().mockResolvedValue({
    content: [
      { orderId: 'o1', userId: 'u1', status: 'PENDING', totalPrice: 30000, itemCount: 2, createdAt: '2026-03-20T10:00:00Z' },
      { orderId: 'o2', userId: 'u2', status: 'CANCELLED', totalPrice: 15000, itemCount: 1, createdAt: '2026-03-21T10:00:00Z' },
    ],
    totalElements: 2,
    page: 0,
    size: 20,
  }),
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('OrderList', () => {
  it('주문 목록을 테이블에 표시한다', async () => {
    render(<OrderList />, { wrapper: createWrapper() });

    expect(await screen.findByText('30,000원')).toBeInTheDocument();
    expect(screen.getByText('15,000원')).toBeInTheDocument();
  });

  it('로딩 중일 때 스피너를 표시한다', () => {
    render(<OrderList />, { wrapper: createWrapper() });
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('상태 필터를 표시한다', async () => {
    render(<OrderList />, { wrapper: createWrapper() });

    await screen.findByText('30,000원');
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByText('전체 상태')).toBeInTheDocument();
  });

  it('주문 상태 뱃지를 표시한다', async () => {
    render(<OrderList />, { wrapper: createWrapper() });

    await screen.findByText('30,000원');
    const pendingBadges = screen.getAllByText('대기');
    expect(pendingBadges.length).toBeGreaterThanOrEqual(2); // FilterBar option + StatusBadge
    const cancelBadges = screen.getAllByText('취소');
    expect(cancelBadges.length).toBeGreaterThanOrEqual(2); // FilterBar option + StatusBadge
  });
});
