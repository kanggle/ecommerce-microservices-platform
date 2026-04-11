'use client';

import type { CartItem } from '../model/types';
import { useCart } from '../model/cart-context';
import { PriceDisplay } from '@/shared/ui';

interface CartItemRowProps {
  item: CartItem;
}

export function CartItemRow({ item }: CartItemRowProps) {
  const { updateQuantity, removeItem } = useCart();

  const quantityBtnStyle: React.CSSProperties = {
    width: '32px',
    height: '32px',
    padding: 0,
    borderRadius: 'var(--radius-full)',
    fontSize: 'var(--font-size-base)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  return (
    <div
      className="card"
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 'var(--space-4) var(--space-5)',
        marginBottom: 'var(--space-3)',
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            margin: '0 0 var(--space-1)',
            fontWeight: 'var(--font-weight-semibold)',
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-text)',
          }}
        >
          {item.productName}
        </p>
        <p
          style={{
            margin: 0,
            fontSize: 'var(--font-size-xs)',
            color: 'var(--color-text-secondary)',
          }}
        >
          {item.optionName}
        </p>
        <p
          className="price"
          style={{
            margin: 'var(--space-2) 0 0',
            fontSize: 'var(--font-size-sm)',
          }}
        >
          <PriceDisplay amount={item.price} />
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexShrink: 0 }}>
        <button
          type="button"
          onClick={() => updateQuantity(item.productId, item.variantId, item.quantity - 1)}
          aria-label="수량 감소"
          className="btn btn-outline"
          style={quantityBtnStyle}
        >
          −
        </button>
        <span
          style={{
            minWidth: '28px',
            textAlign: 'center',
            fontWeight: 'var(--font-weight-semibold)',
            fontSize: 'var(--font-size-sm)',
          }}
        >
          {item.quantity}
        </span>
        <button
          type="button"
          onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)}
          aria-label="수량 증가"
          className="btn btn-outline"
          style={quantityBtnStyle}
        >
          +
        </button>
        <button
          type="button"
          onClick={() => removeItem(item.productId, item.variantId)}
          aria-label="삭제"
          className="btn-delete-text"
          style={{ marginLeft: 'var(--space-2)' }}
        >
          삭제
        </button>
      </div>
    </div>
  );
}
