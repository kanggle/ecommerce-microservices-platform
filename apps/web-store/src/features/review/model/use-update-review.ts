import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateReview } from '../api/review-api';
import { reviewKeys } from './query-keys';
import { getErrorMessage } from '@repo/types/guards';
import type { UpdateReviewRequest } from '@repo/types';

export function useUpdateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reviewId, data }: { reviewId: string; data: UpdateReviewRequest }) =>
      updateReview(reviewId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.all });
    },
    onError: (error) => {
      window.alert(getErrorMessage(error, '리뷰 수정에 실패했습니다.'));
    },
  });
}
