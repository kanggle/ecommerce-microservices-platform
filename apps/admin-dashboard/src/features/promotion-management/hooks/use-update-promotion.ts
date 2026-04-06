import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updatePromotion } from '../api/promotion-api';
import { promotionKeys } from './query-keys';
import { alertError } from '@/shared/lib/alert-error';
import type { UpdatePromotionRequest } from '@repo/types';

export function useUpdatePromotion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ promotionId, data }: { promotionId: string; data: UpdatePromotionRequest }) =>
      updatePromotion(promotionId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: promotionKeys.all });
      queryClient.invalidateQueries({
        queryKey: promotionKeys.detail(variables.promotionId),
      });
    },
    onError: (error: unknown) => {
      alertError(error, '프로모션 수정에 실패했습니다.');
    },
  });
}
