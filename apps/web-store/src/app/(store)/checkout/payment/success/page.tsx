'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { confirmPayment } from '@/entities/payment';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(true);
  const calledRef = useRef(false);

  const paymentKey = searchParams.get('paymentKey');
  const orderId = searchParams.get('orderId');
  const amount = Number(searchParams.get('amount'));

  useEffect(() => {
    if (calledRef.current) return;

    if (!paymentKey || !orderId || !amount || isNaN(amount)) {
      setError('결제 정보가 올바르지 않습니다.');
      setIsConfirming(false);
      return;
    }

    calledRef.current = true;

    confirmPayment({ paymentKey, orderId, amount })
      .then(() => {
        router.replace(`/checkout/complete?orderId=${orderId}`);
      })
      .catch((err) => {
        const message = err?.message ?? '결제 승인에 실패했습니다.';
        setError(message);
        setIsConfirming(false);
      });
  }, [paymentKey, orderId, amount, router]);

  if (isConfirming) {
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
