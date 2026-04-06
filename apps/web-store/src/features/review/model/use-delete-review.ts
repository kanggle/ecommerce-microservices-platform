import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteReview } from '../api/review-api';
import { reviewKeys } from './query-keys';
import { getErrorMessage } from '@repo/types/guards';

export function useDeleteReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reviewId: string) => deleteReview(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.all });
    },
    onError: (error) => {
      window.alert(getErrorMessage(error, '리뷰 삭제에 실패했습니다.'));
    },
  });
}
