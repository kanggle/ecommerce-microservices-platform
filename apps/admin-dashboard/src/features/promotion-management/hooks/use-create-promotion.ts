import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createPromotion } from '../api/promotion-api';
import { promotionKeys } from './query-keys';
import { alertError } from '@/shared/lib/alert-error';

export function useCreatePromotion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPromotion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: promotionKeys.all });
    },
    onError: (error: unknown) => {
      alertError(error, '프로모션 생성에 실패했습니다.');
    },
  });
}
