import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { OrderDetail } from '@/features/order-management/components/OrderDetail';

const mockOrder = {
  orderId: 'o1',
  userId: 'u1',
  status: 'PENDING' as const,
  totalPrice: 30000,
  items: [
    { productId: 'p1', variantId: 'v1', productName: '상품 A', optionName: '기본', quantity: 2, unitPrice: 15000 },
  ],
  shippingAddress: {
    recipient: '홍길동',
    phone: '010-1234-5678',
    zipCode: '12345',
    address1: '서울시 강남구',
    address2: '101호',
  },
  createdAt: '2026-03-20T10:00:00Z',
  updatedAt: '2026-03-20T10:00:00Z',
};

const mockGetOrder = vi.fn().mockResolvedValue(mockOrder);

vi.mock('@/features/order-management/api/order-api', () => ({
  getOrder: (...args: unknown[]) => mockGetOrder(...args),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('OrderDetail', () => {
  beforeEach(() => {
    mockGetOrder.mockClear();
    mockGetOrder.mockResolvedValue(mockOrder);
  });

  it('주문 기본 정보를 표시한다', async () => {
    render(<OrderDetail orderId="o1" />, { wrapper: createWrapper() });

    expect(await screen.findByText('주문 o1')).toBeInTheDocument();
    const priceElements = screen.getAllByText('30,000원');
    expect(priceElements.length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('대기').length).toBeGreaterThanOrEqual(1);
  });

  it('주문자 ID를 표시한다', async () => {
    render(<OrderDetail orderId="o1" />, { wrapper: createWrapper() });

    expect(await screen.findByText('u1')).toBeInTheDocument();
  });

  it('주문 항목을 표시한다', async () => {
    render(<OrderDetail orderId="o1" />, { wrapper: createWrapper() });

    expect(await screen.findByText('상품 A')).toBeInTheDocument();
    expect(screen.getByText('기본')).toBeInTheDocument();
    expect(screen.getByText('15,000원')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('배송지 정보를 표시한다', async () => {
    render(<OrderDetail orderId="o1" />, { wrapper: createWrapper() });

    expect(await screen.findByText('홍길동')).toBeInTheDocument();
    expect(screen.getByText('010-1234-5678')).toBeInTheDocument();
    expect(screen.getByText('12345')).toBeInTheDocument();
  });

  it('주문 항목이 없으면 안내 메시지를 표시한다', async () => {
    mockGetOrder.mockResolvedValueOnce({ ...mockOrder, items: [] });
    render(<OrderDetail orderId="o1" />, { wrapper: createWrapper() });

    expect(await screen.findByText('주문 항목이 없습니다.')).toBeInTheDocument();
  });
});
