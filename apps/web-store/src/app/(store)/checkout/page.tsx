'use client';

import { useRouter } from 'next/navigation';
import { useRequireAuth } from '@/features/auth';
import { useCart } from '@/features/cart';
import { CheckoutForm, useCheckoutItems } from '@/features/checkout';
import { NarrowContainer } from '@/shared/ui';

export default function CheckoutPage() {
  const router = useRouter();
  const { isReady } = useRequireAuth();
  const { items, removeItem } = useCart();
  const { checkoutItems, totalAmount, completeOrder, isEmpty } = useCheckoutItems({ items, removeItem });

  if (!isReady) return null;
  if (isEmpty) {
    router.replace('/cart');
    return null;
  }

  return (
    <NarrowContainer>
      <CheckoutForm
        items={checkoutItems}
        totalAmount={totalAmount}
        onOrderComplete={completeOrder}
      />
    </NarrowContainer>
  );
}
