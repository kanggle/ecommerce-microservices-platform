'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useRequireAuth } from '@/features/auth';
import { useCart } from '@/features/cart';
import { CheckoutForm } from '@/features/checkout';

export default function CheckoutPage() {
  const router = useRouter();
  const { isReady } = useRequireAuth();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { items, totalAmount, clearCart } = useCart();

  useEffect(() => {
    if (!authLoading && isAuthenticated && items.length === 0) {
      router.replace('/cart');
    }
  }, [authLoading, isAuthenticated, items.length, router]);

  if (!isReady || items.length === 0) return null;

  return (
    <main style={{ maxWidth: '600px', margin: '0 auto', padding: '24px' }}>
      <CheckoutForm
        items={items}
        totalAmount={totalAmount}
        onOrderComplete={clearCart}
      />
    </main>
  );
}
