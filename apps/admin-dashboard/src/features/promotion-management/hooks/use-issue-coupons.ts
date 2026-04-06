import { useMutation, useQueryClient } from '@tanstack/react-query';
import { issueCoupons } from '../api/promotion-api';
import { promotionKeys } from './query-keys';
import { alertError } from '@/shared/lib/alert-error';
import type { IssueCouponsRequest } from '@repo/types';

export function useIssueCoupons(promotionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: IssueCouponsRequest) => issueCoupons(promotionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: promotionKeys.detail(promotionId) });
      queryClient.invalidateQueries({ queryKey: promotionKeys.all });
    },
    onError: (error: unknown) => {
      alertError(error, '쿠폰 발급에 실패했습니다.');
    },
  });
}
