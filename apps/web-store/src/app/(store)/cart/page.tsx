'use client';

import { CartSummary } from '@/features/cart';
import { NarrowContainer } from '@/shared/ui';

export default function CartPage() {
  return (
    <NarrowContainer>
      <CartSummary />
    </NarrowContainer>
  );
}
