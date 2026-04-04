import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CartProvider } from '@/features/cart/model/cart-context';
import { AddToCartButton } from '@/features/cart/ui/AddToCartButton';
import { CartSummary } from '@/features/cart/ui/CartSummary';
import { CartItemRow } from '@/features/cart/ui/CartItemRow';
import type { CartItem } from '@/features/cart/model/types';

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

function renderWithCart(ui: React.ReactNode) {
  return render(<CartProvider>{ui}</CartProvider>);
}

describe('AddToCartButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {});
  });

  it('장바구니 담기 버튼을 표시한다', () => {
    renderWithCart(
      <AddToCartButton
        productId="p1"
        variantId="v1"
        productName="상품"
        optionName="옵션"
        price={10000}
      />,
    );

    expect(screen.getByText('장바구니 담기')).toBeInTheDocument();
  });

  it('품절 시 버튼이 비활성화되고 품절 텍스트를 표시한다', () => {
    renderWithCart(
      <AddToCartButton
        productId="p1"
        variantId="v1"
        productName="상품"
        optionName="옵션"
        price={10000}
        disabled
      />,
    );

    expect(screen.getByText('품절')).toBeDisabled();
  });

  it('클릭 시 장바구니 추가 토스트를 표시한다', async () => {
    const user = userEvent.setup();
    renderWithCart(
      <AddToCartButton
        productId="p1"
        variantId="v1"
        productName="상품"
        optionName="옵션"
        price={10000}
      />,
    );

    await user.click(screen.getByText('장바구니 담기'));

    expect(screen.getByText('장바구니에 추가되었습니다.')).toBeInTheDocument();
  });
});

describe('CartSummary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {});
  });

  it('장바구니가 비어있으면 안내 메시지를 표시한다', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);

    renderWithCart(<CartSummary />);

    await waitFor(() => {
      expect(screen.getByText('장바구니가 비어있습니다.')).toBeInTheDocument();
    });
    expect(screen.getByText('상품 보러 가기')).toHaveAttribute('href', '/products');
  });

  it('상품이 있으면 장바구니 항목과 합계를 표시한다', async () => {
    const items: CartItem[] = [
      {
        productId: 'p1',
        variantId: 'v1',
        productName: '노트북',
        optionName: '실버',
        price: 1500000,
        quantity: 1,
      },
    ];
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(JSON.stringify(items));

    renderWithCart(<CartSummary />);

    await waitFor(() => {
      expect(screen.getByText('노트북')).toBeInTheDocument();
    });
    expect(screen.getByText('실버')).toBeInTheDocument();
    const priceElements = screen.getAllByText('1,500,000원');
    expect(priceElements).toHaveLength(2); // 항목 가격 + 합계
  });

  it('전체 삭제 버튼으로 장바구니를 비운다', async () => {
    const items: CartItem[] = [
      {
        productId: 'p1',
        variantId: 'v1',
        productName: '노트북',
        optionName: '실버',
        price: 1500000,
        quantity: 1,
      },
    ];
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(JSON.stringify(items));

    const user = userEvent.setup();
    renderWithCart(<CartSummary />);

    await waitFor(() => {
      expect(screen.getByText('노트북')).toBeInTheDocument();
    });

    await user.click(screen.getByText('전체 삭제'));

    await waitFor(() => {
      expect(screen.getByText('장바구니가 비어있습니다.')).toBeInTheDocument();
    });
  });
});

describe('CartItemRow', () => {
  const item: CartItem = {
    productId: 'p1',
    variantId: 'v1',
    productName: '마우스',
    optionName: '블랙',
    price: 50000,
    quantity: 2,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(JSON.stringify([item]));
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {});
  });

  it('상품 정보와 수량을 표시한다', async () => {
    renderWithCart(<CartItemRow item={item} />);

    await waitFor(() => {
      expect(screen.getByText('마우스')).toBeInTheDocument();
    });
    expect(screen.getByText('블랙')).toBeInTheDocument();
    expect(screen.getByText('50,000원')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('수량 증가 버튼이 있다', () => {
    renderWithCart(<CartItemRow item={item} />);

    expect(screen.getByLabelText('수량 증가')).toBeInTheDocument();
  });

  it('수량 감소 버튼이 있다', () => {
    renderWithCart(<CartItemRow item={item} />);

    expect(screen.getByLabelText('수량 감소')).toBeInTheDocument();
  });

  it('삭제 버튼이 있다', () => {
    renderWithCart(<CartItemRow item={item} />);

    expect(screen.getByLabelText('삭제')).toBeInTheDocument();
  });
});
