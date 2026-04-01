'use client';

import { CartSummary } from '@/features/cart';

export default function CartPage() {
  return (
    <div className="container" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)', maxWidth: '800px' }}>
      <CartSummary />
    </div>
  );
}
