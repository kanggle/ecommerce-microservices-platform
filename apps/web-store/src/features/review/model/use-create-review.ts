import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createReview } from '../api/review-api';
import { reviewKeys } from './query-keys';
import { getErrorMessage } from '@repo/types/guards';

export function useCreateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.all });
    },
    onError: (error) => {
      window.alert(getErrorMessage(error, '리뷰 작성에 실패했습니다.'));
    },
  });
}
