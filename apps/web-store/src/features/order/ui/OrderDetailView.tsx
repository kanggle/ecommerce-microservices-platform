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
    <main style={{ maxWidth: '800px', margin: '0 auto', padding: '24px' }}>
      {isLoading && <LoadingSpinner />}
      {error && <ErrorMessage message={error} onRetry={retryLoad} />}

      {order && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h1 style={{ margin: 0 }}>주문 상세</h1>
            <OrderStatusBadge status={order.status} />
          </div>

          <section style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '18px', marginBottom: '12px' }}>주문 상품</h2>
            {order.items.map((item) => (
              <div
                key={`${item.productId}-${item.variantId}`}
                style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee' }}
              >
                <span>{item.productName} ({item.optionName}) × {item.quantity}</span>
                <span>{(item.unitPrice * item.quantity).toLocaleString()}원</span>
              </div>
            ))}
            <div style={{ textAlign: 'right', marginTop: '8px', fontWeight: 'bold', fontSize: '18px' }}>
              합계: {order.totalPrice.toLocaleString()}원
            </div>
          </section>

          <section style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '18px', marginBottom: '12px' }}>배송지 정보</h2>
            <p style={{ margin: '4px 0' }}>{order.shippingAddress.recipient}</p>
            <p style={{ margin: '4px 0' }}>{maskPhone(order.shippingAddress.phone)}</p>
            <p style={{ margin: '4px 0' }}>
              ({order.shippingAddress.zipCode}) {order.shippingAddress.address1} {order.shippingAddress.address2}
            </p>
          </section>

          {paymentError && (
            <section style={{ marginBottom: '24px' }}>
              <h2 style={{ fontSize: '18px', marginBottom: '12px' }}>결제 정보</h2>
              <p style={{ color: '#ef4444' }}>{paymentError}</p>
            </section>
          )}

          {payment && !paymentError && (
            <section style={{ marginBottom: '24px' }}>
              <h2 style={{ fontSize: '18px', marginBottom: '12px' }}>결제 정보</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ color: '#666' }}>결제 상태:</span>
                <PaymentStatusBadge status={payment.status} />
              </div>
              <p style={{ margin: '4px 0', color: '#666' }}>
                결제 금액: {payment.amount.toLocaleString()}원
              </p>
              {payment.paidAt && (
                <p style={{ margin: '4px 0', color: '#666' }}>
                  결제일: {new Date(payment.paidAt).toLocaleString('ko-KR')}
                </p>
              )}
              {payment.refundedAt && (
                <p style={{ margin: '4px 0', color: '#666' }}>
                  환불일: {new Date(payment.refundedAt).toLocaleString('ko-KR')}
                </p>
              )}
            </section>
          )}

          <section style={{ marginBottom: '24px' }}>
            <p style={{ fontSize: '14px', color: '#666' }}>
              주문일: {new Date(order.createdAt).toLocaleString('ko-KR')}
            </p>
            <p style={{ fontSize: '14px', color: '#666' }}>
              최종 수정일: {new Date(order.updatedAt).toLocaleString('ko-KR')}
            </p>
          </section>

          {CANCELLABLE_STATUSES.has(order.status) && (
            <button
              type="button"
              onClick={handleCancel}
              disabled={isCancelling}
              style={{
                padding: '12px 24px',
                backgroundColor: '#ef4444',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: isCancelling ? 'not-allowed' : 'pointer',
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
