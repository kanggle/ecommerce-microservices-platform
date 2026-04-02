'use client';

import { CartSummary } from '@/features/cart';

export default function CartPage() {
  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: 'var(--space-8) var(--space-6) var(--space-16)' }}>
      <CartSummary />
    </div>
  );
}
