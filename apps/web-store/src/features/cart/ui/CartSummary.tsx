'use client';

import Link from 'next/link';
import { useCart } from '../model/cart-context';
import { CartItemRow } from './CartItemRow';

export function CartSummary() {
  const { items, totalAmount, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: 'var(--space-16) 0' }}>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)', fontSize: 'var(--font-size-lg)' }}>
          장바구니가 비어있습니다.
        </p>
        <Link
          href="/products"
          className="btn btn-primary btn-lg"
        >
          상품 보러 가기
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
        <h1 className="page-title" style={{ margin: 0 }}>장바구니</h1>
        <button
          type="button"
          onClick={clearCart}
          aria-label="장바구니 전체 삭제"
          className="btn-delete-text"
        >
          전체 삭제
        </button>
      </div>

      <div style={{ marginBottom: 'var(--space-6)' }}>
        {items.map((item) => (
          <CartItemRow key={`${item.productId}-${item.variantId}`} item={item} />
        ))}
      </div>

      <div
        className="card"
        style={{
          padding: 'var(--space-5) var(--space-6)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'var(--color-bg-secondary)',
        }}
      >
        <span style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)' }}>
          합계
        </span>
        <span className="price" style={{ fontSize: 'var(--font-size-xl)' }}>
          {totalAmount.toLocaleString()}원
        </span>
      </div>

      <Link
        href="/checkout"
        className="btn btn-accent btn-lg"
        style={{
          display: 'block',
          width: '100%',
          marginTop: 'var(--space-4)',
          textAlign: 'center',
          fontSize: 'var(--font-size-base)',
        }}
      >
        주문하기
      </Link>
    </div>
  );
}
