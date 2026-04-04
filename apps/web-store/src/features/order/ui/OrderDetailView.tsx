'use client';

import Link from 'next/link';
import type { OrderDetail, PaymentResponse } from '@repo/types';
import { OrderStatusBadge } from '@/entities/order';
import { PaymentStatusBadge } from '@/entities/payment';
import { ErrorMessage } from '@repo/ui';
import { Skeleton } from '@/shared/ui/Skeleton';
import { maskPhone } from '@/shared/lib/mask-phone';
import { useOrderDetail, CANCELLABLE_STATUSES } from '../model/use-order-detail';

interface Props {
  orderId: string;
}

export function OrderDetailView({ orderId }: Props) {
  const {
    order,
    payment,
    paymentError,
    isLoading,
    error,
    isCancelling,
    handleCancel,
    retryLoad,
  } = useOrderDetail(orderId);

  return (
    <main className="container" style={{ maxWidth: '800px', paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
      {isLoading && (
        <div>
          <Skeleton width="80px" height="14px" borderRadius="var(--radius-sm)" />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
            <Skeleton width="120px" height="28px" />
            <Skeleton width="72px" height="24px" borderRadius="var(--radius-full)" />
          </div>

          <section style={{ marginBottom: 'var(--space-8)' }}>
            <Skeleton width="100px" height="18px" />
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--space-2) 0', borderBottom: '1px solid var(--color-border-light)' }}>
                <Skeleton width="60%" height="14px" />
                <Skeleton width="80px" height="14px" />
              </div>
            ))}
            <div style={{ textAlign: 'right', marginTop: 'var(--space-2)' }}>
              <Skeleton width="140px" height="18px" borderRadius="var(--radius-sm)" />
            </div>
          </section>

          <section style={{ marginBottom: 'var(--space-8)' }}>
            <Skeleton width="110px" height="18px" />
            <div style={{ marginTop: 'var(--space-2)', display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
              <Skeleton width="80px" height="14px" />
              <Skeleton width="120px" height="14px" />
              <Skeleton width="70%" height="14px" />
            </div>
          </section>

          <section style={{ marginBottom: 'var(--space-8)' }}>
            <Skeleton width="100px" height="18px" />
            <div style={{ marginTop: 'var(--space-2)', display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
              <Skeleton width="140px" height="14px" />
              <Skeleton width="120px" height="14px" />
            </div>
          </section>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
            <Skeleton width="180px" height="12px" />
            <Skeleton width="200px" height="12px" />
          </div>
        </div>
      )}
      {error && <ErrorMessage message={error} onRetry={retryLoad} />}

      {order && (
        <div>
          <Link href="/my/orders" style={{ display: 'inline-block', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)', textDecoration: 'none' }}>
            &larr; 주문내역
          </Link>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-8)' }}>
            <h1 className="page-title" style={{ margin: 0 }}>주문 상세</h1>
            <OrderStatusBadge status={order.status} />
          </div>

          <section style={{ marginBottom: 'var(--space-8)' }}>
            <h2 className="section-title">주문 상품</h2>
            {order.items.map((item) => (
              <div
                key={`${item.productId}-${item.variantId}`}
                style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--space-2) 0', borderBottom: '1px solid var(--color-border-light)' }}
              >
                <span>{item.productName} ({item.optionName}) × {item.quantity}</span>
                <span className="price">{(item.unitPrice * item.quantity).toLocaleString()}<span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-normal)', color: 'var(--color-text-secondary)', marginLeft: '2px' }}>원</span></span>
              </div>
            ))}
            <div style={{ textAlign: 'right', marginTop: 'var(--space-2)', fontWeight: 'var(--font-weight-bold)', fontSize: 'var(--font-size-lg)' }}>
              합계: {order.totalPrice.toLocaleString()}<span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-normal)', color: 'var(--color-text-secondary)', marginLeft: '2px' }}>원</span>
            </div>
          </section>

          <section style={{ marginBottom: 'var(--space-8)' }}>
            <h2 className="section-title">배송지 정보</h2>
            <p style={{ margin: 'var(--space-1) 0' }}>{order.shippingAddress.recipient}</p>
            <p style={{ margin: 'var(--space-1) 0' }}>{maskPhone(order.shippingAddress.phone)}</p>
            <p style={{ margin: 'var(--space-1) 0' }}>
              ({order.shippingAddress.zipCode}) {order.shippingAddress.address1} {order.shippingAddress.address2}
            </p>
          </section>

          {(paymentError || payment) && (
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
          )}

          <section style={{ marginBottom: 'var(--space-8)' }}>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
              주문일: {new Date(order.createdAt).toLocaleString('ko-KR')}
            </p>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
              최종 수정일: {new Date(order.updatedAt).toLocaleString('ko-KR')}
            </p>
          </section>

          {CANCELLABLE_STATUSES.has(order.status) && (
            <button
              type="button"
              onClick={handleCancel}
              disabled={isCancelling}
              className="btn"
              style={{
                backgroundColor: 'var(--color-error)',
                color: 'var(--color-white)',
              }}
            >
              {isCancelling ? '취소 처리 중...' : '주문 취소'}
            </button>
          )}
        </div>
      )}
    </main>
  );
}
