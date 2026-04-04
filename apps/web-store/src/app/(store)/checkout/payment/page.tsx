'use client';

import { useSearchParams } from 'next/navigation';
import { useRequireAuth } from '@/features/auth';
import { PaymentWidget } from '@/features/checkout';

export default function PaymentPage() {
  const searchParams = useSearchParams();
  const { isReady } = useRequireAuth();

  const orderId = searchParams.get('orderId');
  const amount = Number(searchParams.get('amount'));
  const orderName = searchParams.get('orderName') ?? '주문';

  if (!isReady) return null;

  if (!orderId || !amount || isNaN(amount)) {
    return (
      <div className="container" style={{ paddingTop: 'var(--space-16)', textAlign: 'center' }}>
        <p style={{ color: 'var(--color-error)' }}>잘못된 접근입니다.</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: 'var(--space-8) var(--space-6) var(--space-16)' }}>
      <h1 className="page-title">결제하기</h1>
      <PaymentWidget orderId={orderId} amount={amount} orderName={orderName} />
    </div>
  );
}
