'use client';

import Link from 'next/link';
import { useCart } from '../model/cart-context';
import { CartItemRow } from './CartItemRow';

export function CartSummary() {
  const { items, totalAmount, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 0' }}>
        <p style={{ color: '#666', marginBottom: '16px' }}>장바구니가 비어있습니다.</p>
        <Link href="/products" style={{ color: '#333' }}>
          상품 보러 가기
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h1 style={{ margin: 0, fontSize: '24px' }}>장바구니</h1>
        <button
          type="button"
          onClick={clearCart}
          aria-label="장바구니 전체 삭제"
          style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer' }}
        >
          전체 삭제
        </button>
      </div>

      {items.map((item) => (
        <CartItemRow key={`${item.productId}-${item.variantId}`} item={item} />
      ))}

      <div
        style={{
          marginTop: '24px',
          padding: '16px',
          backgroundColor: '#f9f9f9',
          borderRadius: '8px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span style={{ fontSize: '18px', fontWeight: 'bold' }}>합계</span>
        <span style={{ fontSize: '20px', fontWeight: 'bold' }}>
          {totalAmount.toLocaleString()}원
        </span>
      </div>

      <Link
        href="/checkout"
        style={{
          display: 'block',
          marginTop: '16px',
          padding: '16px',
          textAlign: 'center',
          backgroundColor: '#333',
          color: '#fff',
          textDecoration: 'none',
          borderRadius: '4px',
          fontWeight: 'bold',
          fontSize: '16px',
        }}
      >
        주문하기
      </Link>
    </div>
  );
}
