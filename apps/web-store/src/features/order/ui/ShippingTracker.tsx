'use client';

import type { ShippingStatus, ShippingResponse } from '@repo/types';
import { Skeleton } from '@/shared/ui/Skeleton';
import { useShippingTracking } from '../model/use-shipping-tracking';

const SHIPPING_STEPS: { status: ShippingStatus; label: string }[] = [
  { status: 'PREPARING', label: '상품 준비중' },
  { status: 'SHIPPED', label: '배송 시작' },
  { status: 'IN_TRANSIT', label: '배송중' },
  { status: 'DELIVERED', label: '배송 완료' },
];

function getStepIndex(status: ShippingStatus): number {
  return SHIPPING_STEPS.findIndex((step) => step.status === status);
}

function getDeliveredDate(shipping: ShippingResponse): string | null {
  if (shipping.status !== 'DELIVERED') return null;
  const entry = shipping.statusHistory.find((h) => h.status === 'DELIVERED');
  return entry ? entry.changedAt : null;
}

interface Props {
  orderId: string;
}

export function ShippingTracker({ orderId }: Props) {
  const { shipping, isLoading, isNotFound, error } = useShippingTracking(orderId);

  if (isLoading) {
    return (
      <section style={{ marginBottom: 'var(--space-8)' }}>
        <Skeleton width="110px" height="18px" />
        <div style={{ marginTop: 'var(--space-4)', display: 'flex', gap: 'var(--space-4)' }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} width="60px" height="60px" borderRadius="var(--radius-md)" />
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section style={{ marginBottom: 'var(--space-8)' }}>
        <h2 className="section-title">배송 추적</h2>
        <p style={{ color: 'var(--color-error)' }}>{error}</p>
      </section>
    );
  }

  if (isNotFound) {
    return (
      <section style={{ marginBottom: 'var(--space-8)' }}>
        <h2 className="section-title">배송 추적</h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          배송 준비 중입니다. 배송이 시작되면 추적 정보가 표시됩니다.
        </p>
      </section>
    );
  }

  if (!shipping) return null;

  const currentIndex = getStepIndex(shipping.status);
  const deliveredDate = getDeliveredDate(shipping);
  const showTrackingInfo = currentIndex >= 1; // SHIPPED 이후

  return (
    <section style={{ marginBottom: 'var(--space-8)' }}>
      <h2 className="section-title">배송 추적</h2>

      {/* Step Indicator */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          marginTop: 'var(--space-4)',
          marginBottom: 'var(--space-4)',
        }}
        role="list"
        aria-label="배송 진행 상태"
      >
        {SHIPPING_STEPS.map((step, index) => {
          const isCompleted = index <= currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <div key={step.status} style={{ display: 'flex', alignItems: 'center', flex: index < SHIPPING_STEPS.length - 1 ? 1 : undefined }}>
              <div
                role="listitem"
                aria-current={isCurrent ? 'step' : undefined}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  minWidth: '64px',
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: isCompleted ? 'var(--color-primary)' : 'var(--color-border-light)',
                    color: isCompleted ? 'var(--color-white)' : 'var(--color-text-secondary)',
                    fontWeight: 'var(--font-weight-bold)',
                    fontSize: 'var(--font-size-sm)',
                    transition: 'background-color 0.2s',
                  }}
                >
                  {isCompleted ? '\u2713' : index + 1}
                </div>
                <span
                  style={{
                    marginTop: 'var(--space-1)',
                    fontSize: 'var(--font-size-xs)',
                    color: isCompleted ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                    fontWeight: isCurrent ? 'var(--font-weight-bold)' : 'var(--font-weight-normal)',
                    textAlign: 'center',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {step.label}
                </span>
              </div>
              {index < SHIPPING_STEPS.length - 1 && (
                <div
                  style={{
                    flex: 1,
                    height: '2px',
                    backgroundColor: index < currentIndex ? 'var(--color-primary)' : 'var(--color-border-light)',
                    marginLeft: 'var(--space-1)',
                    marginRight: 'var(--space-1)',
                    marginBottom: 'var(--space-4)',
                    transition: 'background-color 0.2s',
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Tracking Info */}
      {showTrackingInfo && (
        <div style={{ marginTop: 'var(--space-2)' }}>
          <p style={{ margin: 'var(--space-1) 0', color: 'var(--color-text-secondary)' }}>
            택배사: {shipping.carrier ?? '정보 없음'}
          </p>
          <p style={{ margin: 'var(--space-1) 0', color: 'var(--color-text-secondary)' }}>
            운송장 번호: {shipping.trackingNumber ?? '정보 없음'}
          </p>
        </div>
      )}

      {/* Delivered Date */}
      {deliveredDate && (
        <p style={{ margin: 'var(--space-1) 0', color: 'var(--color-text-secondary)' }}>
          배송 완료일: {new Date(deliveredDate).toLocaleString('ko-KR')}
        </p>
      )}
    </section>
  );
}
