import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { OrderDetail } from '@/features/order-management/components/OrderDetail';

const mockOrder = {
  orderId: 'o1',
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
const mockCancelOrder = vi.fn().mockResolvedValue({ orderId: 'o1', status: 'CANCELLED' });

vi.mock('@/features/order-management/api/order-api', () => ({
  getOrder: (...args: unknown[]) => mockGetOrder(...args),
  cancelOrder: (...args: unknown[]) => mockCancelOrder(...args),
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
    mockCancelOrder.mockClear();
    mockGetOrder.mockResolvedValue(mockOrder);
  });

  it('주문 기본 정보를 표시한다', async () => {
    render(<OrderDetail orderId="o1" />, { wrapper: createWrapper() });

    expect(await screen.findByText('주문 o1')).toBeInTheDocument();
    const priceElements = screen.getAllByText('30,000원');
    expect(priceElements.length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('대기').length).toBeGreaterThanOrEqual(1);
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
    expect(screen.getByText('서울시 강남구 101호')).toBeInTheDocument();
  });

  it('PENDING 상태에서 취소 버튼을 표시한다', async () => {
    render(<OrderDetail orderId="o1" />, { wrapper: createWrapper() });

    expect(await screen.findByText('주문 취소')).toBeInTheDocument();
  });

  it('취소 버튼 클릭 시 확인 다이얼로그를 표시한다', async () => {
    const user = userEvent.setup();
    render(<OrderDetail orderId="o1" />, { wrapper: createWrapper() });

    await screen.findByText('주문 취소');
    await user.click(screen.getByText('주문 취소'));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('이 주문을 취소하시겠습니까? 이 작업은 되돌릴 수 없습니다.')).toBeInTheDocument();
  });

  it('확인 다이얼로그에서 취소하기 클릭 시 API를 호출한다', async () => {
    const user = userEvent.setup();
    render(<OrderDetail orderId="o1" />, { wrapper: createWrapper() });

    await screen.findByText('주문 취소');
    await user.click(screen.getByText('주문 취소'));
    await user.click(screen.getByText('취소하기'));

    expect(mockCancelOrder).toHaveBeenCalledWith('o1');
  });

  it('SHIPPED 상태에서는 취소 버튼을 표시하지 않는다', async () => {
    mockGetOrder.mockResolvedValueOnce({ ...mockOrder, status: 'SHIPPED' });
    render(<OrderDetail orderId="o1" />, { wrapper: createWrapper() });

    await screen.findByText('주문 o1');
    expect(screen.queryByText('주문 취소')).not.toBeInTheDocument();
  });

  it('CANCELLED 상태에서는 취소 버튼을 표시하지 않는다', async () => {
    mockGetOrder.mockResolvedValueOnce({ ...mockOrder, status: 'CANCELLED' });
    render(<OrderDetail orderId="o1" />, { wrapper: createWrapper() });

    await screen.findByText('주문 o1');
    expect(screen.queryByText('주문 취소')).not.toBeInTheDocument();
  });

  it('주문 항목이 없으면 안내 메시지를 표시한다', async () => {
    mockGetOrder.mockResolvedValueOnce({ ...mockOrder, items: [] });
    render(<OrderDetail orderId="o1" />, { wrapper: createWrapper() });

    expect(await screen.findByText('주문 항목이 없습니다.')).toBeInTheDocument();
  });

  it('취소 mutation 진행 중 취소 버튼이 비활성화된다', async () => {
    let rejectFn: (reason: unknown) => void;
    mockCancelOrder.mockImplementationOnce(
      () => new Promise((_resolve, reject) => { rejectFn = reject; }),
    );

    const user = userEvent.setup();
    render(<OrderDetail orderId="o1" />, { wrapper: createWrapper() });

    await screen.findByText('주문 취소');
    await user.click(screen.getByText('주문 취소'));
    await user.click(screen.getByText('취소하기'));

    const cancelButton = screen.getByText('취소 중...');
    expect(cancelButton).toBeDisabled();

    rejectFn!(new Error('cancel'));
  });
});
