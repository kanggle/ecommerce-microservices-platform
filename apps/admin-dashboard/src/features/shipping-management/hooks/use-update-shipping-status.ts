import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateShippingStatus } from '../api/shipping-api';
import { shippingKeys } from './query-keys';
import { alertError } from '@/shared/lib/alert-error';
import type { UpdateShippingStatusRequest } from '@repo/types';

export function useUpdateShippingStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ shippingId, data }: { shippingId: string; data: UpdateShippingStatusRequest }) =>
      updateShippingStatus(shippingId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: shippingKeys.all });
    },
    onError: (error) => {
      alertError(error, '배송 상태 변경에 실패했습니다.');
    },
  });
}
