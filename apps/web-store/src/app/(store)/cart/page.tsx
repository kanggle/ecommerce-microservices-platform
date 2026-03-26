'use client';

import { CartSummary } from '@/features/cart';

export default function CartPage() {
  return (
    <main style={{ maxWidth: '800px', margin: '0 auto', padding: '24px' }}>
      <CartSummary />
    </main>
  );
}
