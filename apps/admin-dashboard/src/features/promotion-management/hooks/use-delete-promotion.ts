import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deletePromotion } from '../api/promotion-api';
import { promotionKeys } from './query-keys';
import { alertError } from '@/shared/lib/alert-error';

export function useDeletePromotion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePromotion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: promotionKeys.all });
    },
    onError: (error: unknown) => {
      alertError(error, '프로모션 삭제에 실패했습니다.');
    },
  });
}
