'use client';

import type { CartItem } from '../model/types';
import { useCart } from '../model/cart-context';

interface CartItemRowProps {
  item: CartItem;
}

export function CartItemRow({ item }: CartItemRowProps) {
  const { updateQuantity, removeItem } = useCart();

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 0',
        borderBottom: '1px solid #eee',
      }}
    >
      <div>
        <p style={{ margin: '0 0 4px', fontWeight: 'bold' }}>{item.productName}</p>
        <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>{item.optionName}</p>
        <p style={{ margin: '4px 0 0', fontSize: '14px' }}>
          {item.price.toLocaleString()}원
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          type="button"
          onClick={() => updateQuantity(item.productId, item.variantId, item.quantity - 1)}
          aria-label="수량 감소"
          style={{ width: '32px', height: '32px', fontSize: '16px' }}
        >
          −
        </button>
        <span style={{ minWidth: '24px', textAlign: 'center' }}>{item.quantity}</span>
        <button
          type="button"
          onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)}
          aria-label="수량 증가"
          style={{ width: '32px', height: '32px', fontSize: '16px' }}
        >
          +
        </button>
        <button
          type="button"
          onClick={() => removeItem(item.productId, item.variantId)}
          aria-label="삭제"
          style={{ marginLeft: '8px', color: '#e00', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          삭제
        </button>
      </div>
    </div>
  );
}
