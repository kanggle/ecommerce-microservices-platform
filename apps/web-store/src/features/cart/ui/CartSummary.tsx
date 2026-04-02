'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '../model/cart-context';

export function CartSummary() {
  const { items, updateQuantity, removeItem } = useCart();
  const [checkedSet, setCheckedSet] = useState<Set<string>>(() =>
    new Set(items.map((i) => `${i.productId}-${i.variantId}`)),
  );

  if (items.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: 'var(--space-16) 0' }}>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)', fontSize: 'var(--font-size-lg)' }}>
          장바구니가 비어있습니다.
        </p>
        <Link href="/products" className="btn btn-primary btn-lg">
          상품 보러 가기
        </Link>
      </div>
    );
  }

  const allChecked = items.length > 0 && items.every((i) => checkedSet.has(`${i.productId}-${i.variantId}`));
  const checkedItems = items.filter((i) => checkedSet.has(`${i.productId}-${i.variantId}`));
  const totalAmount = checkedItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

  function toggleAll() {
    if (allChecked) {
      setCheckedSet(new Set());
    } else {
      setCheckedSet(new Set(items.map((i) => `${i.productId}-${i.variantId}`)));
    }
  }

  function toggleItem(key: string) {
    setCheckedSet((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function removeChecked() {
    for (const item of checkedItems) {
      removeItem(item.productId, item.variantId);
    }
    setCheckedSet(new Set());
  }

  return (
    <div>
      <h1 className="page-title" style={{ marginBottom: 'var(--space-6)' }}>장바구니</h1>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', cursor: 'pointer' }}>
          <input type="checkbox" checked={allChecked} onChange={toggleAll} />
          전체선택
        </label>
        <button
          type="button"
          onClick={removeChecked}
          disabled={checkedItems.length === 0}
          className="btn-delete-text"
          style={{
            color: checkedItems.length === 0 ? 'var(--color-text-muted)' : undefined,
            cursor: checkedItems.length === 0 ? 'default' : undefined,
          }}
        >
          선택 삭제
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginBottom: 'var(--space-6)' }}>
        {items.map((item) => {
          const key = `${item.productId}-${item.variantId}`;
          const checked = checkedSet.has(key);
          return (
            <div
              key={key}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-3)',
                padding: 'var(--space-3)',
                border: '1px solid var(--color-border-light)',
                borderRadius: 'var(--radius-md)',
                opacity: checked ? 1 : 0.5,
                transition: 'opacity var(--transition-fast)',
              }}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggleItem(key)}
                style={{ flexShrink: 0 }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                  {item.productName}
                </div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                  {item.optionName}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden', flexShrink: 0, width: 88 }}>
                <button
                  type="button"
                  onClick={() => updateQuantity(item.productId, item.variantId, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                  style={{
                    width: 28, height: 28, border: 'none', background: 'var(--color-bg-secondary)',
                    fontSize: 'var(--font-size-sm)', cursor: item.quantity <= 1 ? 'not-allowed' : 'pointer',
                    color: item.quantity <= 1 ? 'var(--color-text-muted)' : 'var(--color-text)',
                  }}
                >
                  −
                </button>
                <span style={{
                  flex: 1, textAlign: 'center', fontSize: 'var(--font-size-sm)',
                  fontWeight: 'var(--font-weight-semibold)', lineHeight: '28px',
                  borderLeft: '1px solid var(--color-border)', borderRight: '1px solid var(--color-border)',
                }}>
                  {item.quantity}
                </span>
                <button
                  type="button"
                  onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)}
                  style={{
                    width: 28, height: 28, border: 'none', background: 'var(--color-bg-secondary)',
                    fontSize: 'var(--font-size-sm)', cursor: 'pointer', color: 'var(--color-text)',
                  }}
                >
                  +
                </button>
              </div>
              <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-bold)', whiteSpace: 'nowrap', width: 80, textAlign: 'right', flexShrink: 0 }} className="price">
                {(item.price * item.quantity).toLocaleString()}<span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-normal)', color: 'var(--color-text-secondary)', marginLeft: '2px' }}>원</span>
              </span>
            </div>
          );
        })}
      </div>

      <div
        style={{
          padding: 'var(--space-4) var(--space-5)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'var(--color-bg-secondary)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border-light)',
        }}
      >
        <span style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-semibold)' }}>
          합계
        </span>
        <span className="price" style={{ fontSize: 'var(--font-size-xl)' }}>
          {totalAmount.toLocaleString()}<span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-normal)', color: 'var(--color-text-secondary)', marginLeft: '2px' }}>원</span>
        </span>
      </div>

      <Link
        href={`/checkout?items=${encodeURIComponent(checkedItems.map((i) => `${i.productId}:${i.variantId}`).join(','))}`}
        className="btn btn-accent btn-lg"
        style={{
          display: 'block',
          width: '100%',
          marginTop: 'var(--space-4)',
          textAlign: 'center',
          fontSize: 'var(--font-size-base)',
          opacity: checkedItems.length === 0 ? 0.5 : 1,
          pointerEvents: checkedItems.length === 0 ? 'none' : 'auto',
        }}
      >
        {checkedItems.length === 0 ? '상품을 선택하세요' : '주문하기'}
      </Link>
    </div>
  );
}
