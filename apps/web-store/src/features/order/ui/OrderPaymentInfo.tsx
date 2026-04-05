import type { PaymentResponse } from '@repo/types';
import { PaymentStatusBadge } from '@/entities/payment';

interface Props {
  payment: PaymentResponse | null;
  paymentError: string;
}

export function OrderPaymentInfo({ payment, paymentError }: Props) {
  if (!paymentError && !payment) return null;

  return (
    <section style={{ marginBottom: 'var(--space-8)' }}>
      <h2 className="section-title">결제 정보</h2>
      {paymentError ? (
        <p style={{ color: 'var(--color-error)' }}>{paymentError}</p>
      ) : payment && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
            <span style={{ color: 'var(--color-text-secondary)' }}>결제 상태:</span>
            <PaymentStatusBadge status={payment.status} />
          </div>
          <p style={{ margin: 'var(--space-1) 0', color: 'var(--color-text-secondary)' }}>
            결제 금액: {payment.amount.toLocaleString()}<span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-normal)', color: 'var(--color-text-secondary)', marginLeft: '2px' }}>원</span>
          </p>
          {payment.paidAt && (
            <p style={{ margin: 'var(--space-1) 0', color: 'var(--color-text-secondary)' }}>
              결제일: {new Date(payment.paidAt).toLocaleString('ko-KR')}
            </p>
          )}
          {payment.refundedAt && (
            <p style={{ margin: 'var(--space-1) 0', color: 'var(--color-text-secondary)' }}>
              환불일: {new Date(payment.refundedAt).toLocaleString('ko-KR')}
            </p>
          )}
        </>
      )}
    </section>
  );
}
