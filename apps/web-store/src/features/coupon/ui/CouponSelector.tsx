'use client';

import { useState } from 'react';
import type { CouponSummary, ApplyCouponResponse } from '@repo/types';
import { ErrorMessage, EmptyState } from '@repo/ui';
import { Skeleton } from '@/shared/ui/Skeleton';
import { useCoupons } from '../model/use-coupons';
import { useApplyCoupon } from '../model/use-apply-coupon';
import { CouponCard } from './CouponCard';

interface CouponSelectorProps {
  orderAmount: number;
  onCouponApplied: (result: ApplyCouponResponse | null) => void;
}

export function CouponSelector({ orderAmount, onCouponApplied }: CouponSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCouponId, setSelectedCouponId] = useState<string | null>(null);
  const { data, isLoading, isError, refetch } = useCoupons(0, 100, 'ISSUED');
  const applyMutation = useApplyCoupon();

  const coupons = data?.content ?? [];

  async function handleSelect(couponId: string) {
    if (selectedCouponId === couponId) {
      setSelectedCouponId(null);
      onCouponApplied(null);
      return;
    }

    try {
      const result = await applyMutation.mutateAsync({
        couponId,
        data: { orderId: '', orderAmount },
      });
      setSelectedCouponId(couponId);
      onCouponApplied(result);
    } catch {
      // error handled in useApplyCoupon onError
    }
  }

  function handleRemoveCoupon() {
    setSelectedCouponId(null);
    onCouponApplied(null);
  }

  const selectedCoupon = coupons.find((c) => c.couponId === selectedCouponId);

  return (
    <section style={{ marginBottom: 'var(--space-8)' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 'var(--space-3)',
      }}>
        <h2 className="section-title" style={{ margin: 0 }}>쿠폰</h2>
        <button
          type="button"
          className="btn"
          style={{ fontSize: 'var(--font-size-sm)' }}
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? '닫기' : selectedCoupon ? '변경' : '쿠폰 선택'}
        </button>
      </div>

      {selectedCoupon && !isOpen && (
        <div
          data-testid="selected-coupon"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 'var(--space-3) var(--space-4)',
            border: '1px solid var(--color-primary)',
            borderRadius: 'var(--radius-md)',
            background: 'var(--color-primary-50, #f0f4ff)',
          }}
        >
          <div>
            <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)' }}>
              {selectedCoupon.promotionName}
            </div>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
              {selectedCoupon.discountType === 'FIXED'
                ? `${selectedCoupon.discountValue.toLocaleString()}원 할인`
                : `${selectedCoupon.discountValue}% 할인`}
            </div>
          </div>
          <button
            type="button"
            className="btn"
            style={{ fontSize: 'var(--font-size-xs)' }}
            onClick={handleRemoveCoupon}
          >
            해제
          </button>
        </div>
      )}

      {isOpen && (
        <div data-testid="coupon-selector-list">
          {isLoading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} style={{ padding: 'var(--space-3)', border: '1px solid var(--color-border-light)', borderRadius: 'var(--radius-md)' }}>
                  <Skeleton width="50%" height="18px" />
                  <div style={{ marginTop: 'var(--space-2)' }}>
                    <Skeleton width="70%" height="14px" />
                  </div>
                </div>
              ))}
            </div>
          )}
          {isError && <ErrorMessage message="쿠폰 목록을 불러오는데 실패했습니다." onRetry={() => refetch()} />}
          {!isLoading && !isError && coupons.length === 0 && (
            <EmptyState message="사용 가능한 쿠폰이 없습니다." />
          )}
          {coupons.map((coupon) => (
            <CouponCard
              key={coupon.couponId}
              coupon={coupon}
              selectable
              selected={coupon.couponId === selectedCouponId}
              onSelect={handleSelect}
            />
          ))}
          {applyMutation.isPending && (
            <div style={{
              textAlign: 'center',
              padding: 'var(--space-2)',
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-text-secondary)',
            }}>
              쿠폰 적용 중...
            </div>
          )}
        </div>
      )}
    </section>
  );
}
