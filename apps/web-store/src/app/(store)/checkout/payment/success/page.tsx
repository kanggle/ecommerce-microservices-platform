'use client';

import { useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useConfirmPayment } from '@/features/checkout';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const calledRef = useRef(false);
  const confirmMutation = useConfirmPayment();

  const paymentKey = searchParams.get('paymentKey');
  const orderId = searchParams.get('orderId');
  const amount = Number(searchParams.get('amount'));

  const hasValidParams = !!paymentKey && !!orderId && !isNaN(amount) && amount > 0;

  useEffect(() => {
    if (calledRef.current || !hasValidParams) return;

    calledRef.current = true;

    confirmMutation.mutate(
      { paymentKey: paymentKey!, orderId: orderId!, amount },
      {
        onSuccess: () => {
          router.replace(`/checkout/complete?orderId=${orderId}`);
        },
      },
    );
    // calledRef prevents re-execution; confirmMutation identity changes each render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasValidParams, paymentKey, orderId, amount, router]);

  if (!hasValidParams) {
    return (
      <div className="container" style={{ paddingTop: 'var(--space-16)', textAlign: 'center' }}>
        <p role="alert" style={{ color: 'var(--color-error)', marginBottom: 'var(--space-4)' }}>
          결제 정보가 올바르지 않습니다.
        </p>
        <button className="btn btn-primary" onClick={() => router.push('/cart')}>
          장바구니로 이동
        </button>
      </div>
    );
  }

  const error = confirmMutation.isError
    ? (confirmMutation.error?.message ?? '결제 승인에 실패했습니다.')
    : null;

  if (confirmMutation.isPending || confirmMutation.isIdle) {
    return (
      <div className="container" style={{ paddingTop: 'var(--space-16)', textAlign: 'center' }}>
        <p>결제 승인 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={{ paddingTop: 'var(--space-16)', textAlign: 'center' }}>
        <p role="alert" style={{ color: 'var(--color-error)', marginBottom: 'var(--space-4)' }}>
          {error}
        </p>
        <button
          className="btn btn-primary"
          onClick={() => {
            if (orderId) {
              router.push(`/checkout/payment?orderId=${orderId}&amount=${amount}&orderName=재시도`);
            } else {
              router.push('/cart');
            }
          }}
        >
          다시 시도
        </button>
      </div>
    );
  }

  return null;
}
