'use client';

import type { OrderDetail, PaymentResponse } from '@repo/types';
import { OrderStatusBadge } from '@/entities/order';
import { PaymentStatusBadge } from '@/entities/payment';
import { LoadingSpinner, ErrorMessage } from '@repo/ui';
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
      {isLoading && <LoadingSpinner />}
      {error && <ErrorMessage message={error} onRetry={retryLoad} />}

      {order && (
        <div>
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
                <span className="price">{(item.unitPrice * item.quantity).toLocaleString()}원</span>
              </div>
            ))}
            <div style={{ textAlign: 'right', marginTop: 'var(--space-2)', fontWeight: 'var(--font-weight-bold)', fontSize: 'var(--font-size-lg)' }}>
              합계: {order.totalPrice.toLocaleString()}원
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
                    결제 금액: {payment.amount.toLocaleString()}원
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
