import { useMutation } from '@tanstack/react-query';
import { applyCoupon } from '../api/coupon-api';
import { getErrorMessage } from '@repo/types/guards';
import type { ApplyCouponRequest } from '@repo/types';

interface ApplyCouponParams {
  couponId: string;
  data: ApplyCouponRequest;
}

export function useApplyCoupon() {
  return useMutation({
    mutationFn: ({ couponId, data }: ApplyCouponParams) =>
      applyCoupon(couponId, data),
    onError: (error) => {
      window.alert(getErrorMessage(error, '쿠폰 적용에 실패했습니다.'));
    },
  });
}
