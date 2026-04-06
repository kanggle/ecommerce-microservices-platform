import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { OrderItemsSection } from '@/features/checkout/ui/OrderItemsSection';
import type { CheckoutCartItem } from '@/features/checkout/model/types';

const items: CheckoutCartItem[] = [
  {
    productId: 'p1',
    variantId: 'v1',
    productName: '테스트 상품 A',
    optionName: '빨강',
    price: 10000,
    quantity: 2,
  },
  {
    productId: 'p2',
    variantId: 'v2',
    productName: '테스트 상품 B',
    optionName: '파랑',
    price: 20000,
    quantity: 1,
  },
];

describe('OrderItemsSection', () => {
  it('주문 상품 제목을 표시한다', () => {
    render(<OrderItemsSection items={items} totalAmount={40000} />);

    expect(screen.getByText('주문 상품')).toBeInTheDocument();
  });

  it('각 상품 이름을 표시한다', () => {
    render(<OrderItemsSection items={items} totalAmount={40000} />);

    expect(screen.getByText('테스트 상품 A')).toBeInTheDocument();
    expect(screen.getByText('테스트 상품 B')).toBeInTheDocument();
  });

  it('옵션 이름과 수량을 표시한다', () => {
    render(<OrderItemsSection items={items} totalAmount={40000} />);

    expect(screen.getByText(/빨강 × 2/)).toBeInTheDocument();
    expect(screen.getByText(/파랑 × 1/)).toBeInTheDocument();
  });

  it('각 상품의 소계를 표시한다', () => {
    render(<OrderItemsSection items={items} totalAmount={40000} />);

    const priceElements = screen.getAllByText('20,000');
    expect(priceElements).toHaveLength(2);
  });

  it('합계 금액을 표시한다', () => {
    render(<OrderItemsSection items={items} totalAmount={40000} />);

    expect(screen.getByText('40,000')).toBeInTheDocument();
  });

  it('빈 목록이면 상품 항목을 표시하지 않는다', () => {
    render(<OrderItemsSection items={[]} totalAmount={0} />);

    expect(screen.getByText('주문 상품')).toBeInTheDocument();
    expect(screen.queryByText('테스트 상품 A')).not.toBeInTheDocument();
  });
});
