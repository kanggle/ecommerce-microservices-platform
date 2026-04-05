import type { CheckoutCartItem } from '../model/types';

interface OrderItemsSectionProps {
  items: CheckoutCartItem[];
  totalAmount: number;
}

export function OrderItemsSection({ items, totalAmount }: OrderItemsSectionProps) {
  return (
    <section style={{ marginBottom: 'var(--space-8)' }}>
      <h2 className="section-title">주문 상품</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        {items.map((item) => (
          <div
            key={`${item.productId}-${item.variantId}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-3)',
              padding: 'var(--space-3)',
              border: '1px solid var(--color-border-light)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                {item.productName}
              </div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                {item.optionName} × {item.quantity}
              </div>
            </div>
            <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-bold)', whiteSpace: 'nowrap', flexShrink: 0 }} className="price">
              {(item.price * item.quantity).toLocaleString()}<span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-normal)', color: 'var(--color-text-secondary)', marginLeft: '2px' }}>원</span>
            </span>
          </div>
        ))}
      </div>
      <div
        style={{
          textAlign: 'right',
          marginTop: 'var(--space-4)',
          fontWeight: 'var(--font-weight-bold)',
          fontSize: 'var(--font-size-lg)',
        }}
      >
        합계: <span className="price">{totalAmount.toLocaleString()}<span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-normal)', color: 'var(--color-text-secondary)', marginLeft: '2px' }}>원</span></span>
      </div>
    </section>
  );
}
