import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { AddToCartButton } from '@/features/cart/ui/AddToCartButton';

const mockAddItem = vi.fn();

vi.mock('@/features/cart/model/cart-context', () => ({
  useCart: () => ({ addItem: mockAddItem }),
}));

describe('AddToCartButton', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockAddItem.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const defaultProps = {
    productId: 'p1',
    variantId: 'v1',
    productName: '상품A',
    optionName: '옵션1',
    price: 10000,
  };

  it('클릭 시 addItem을 호출하고 담았습니다 상태를 표시한다', () => {
    render(<AddToCartButton {...defaultProps} />);

    fireEvent.click(screen.getByRole('button'));

    expect(mockAddItem).toHaveBeenCalledWith({
      productId: 'p1',
      variantId: 'v1',
      productName: '상품A',
      optionName: '옵션1',
      price: 10000,
    });
    expect(screen.getByRole('button')).toHaveTextContent('담았습니다');
  });

  it('1500ms 후 장바구니 담기 상태로 복원된다', () => {
    render(<AddToCartButton {...defaultProps} />);

    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByRole('button')).toHaveTextContent('담았습니다');

    act(() => {
      vi.advanceTimersByTime(1500);
    });

    expect(screen.getByRole('button')).toHaveTextContent('장바구니 담기');
  });

  it('언마운트 시 setTimeout이 정리되어 state update가 발생하지 않는다', () => {
    const { unmount } = render(<AddToCartButton {...defaultProps} />);

    fireEvent.click(screen.getByRole('button'));
    unmount();

    // 언마운트 후 타이머가 실행되어도 에러가 발생하지 않아야 한다
    act(() => {
      vi.advanceTimersByTime(1500);
    });
  });

  it('빠른 연속 클릭 시 이전 타이머가 정리된다', () => {
    render(<AddToCartButton {...defaultProps} />);

    fireEvent.click(screen.getByRole('button'));
    act(() => {
      vi.advanceTimersByTime(500);
    });
    // 500ms 후 다시 클릭
    fireEvent.click(screen.getByRole('button'));

    expect(screen.getByRole('button')).toHaveTextContent('담았습니다');

    // 첫 클릭 기준 1500ms (=추가 1000ms) 경과해도 아직 담았습니다
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByRole('button')).toHaveTextContent('담았습니다');

    // 두 번째 클릭 기준 1500ms 후 복원
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(screen.getByRole('button')).toHaveTextContent('장바구니 담기');
  });

  it('disabled 상태에서는 품절 텍스트를 표시한다', () => {
    render(<AddToCartButton {...defaultProps} disabled />);
    expect(screen.getByRole('button')).toHaveTextContent('품절');
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
