import { useMutation } from '@tanstack/react-query';
import { applyCoupon } from '../api/coupon-api';
import type { ApplyCouponRequest } from '@repo/types';

interface ApplyCouponParams {
  couponId: string;
  data: ApplyCouponRequest;
}

/**
 * 쿠폰 적용 API 호출 훅.
 * 주문 생성 시 서버 측에서 쿠폰을 적용할 때 사용한다.
 * 에러는 mutation 상태(error, isError)로 전파되며, 호출부에서 처리해야 한다.
 */
export function useApplyCoupon() {
  return useMutation({
    mutationFn: ({ couponId, data }: ApplyCouponParams) =>
      applyCoupon(couponId, data),
  });
}
