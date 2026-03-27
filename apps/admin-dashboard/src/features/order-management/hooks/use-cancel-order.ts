import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getErrorMessage } from '@repo/types/guards';
import { cancelOrder } from '../api/order-api';
import { orderKeys } from './query-keys';

export function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId: string) => cancelOrder(orderId),
    onSuccess: (_data, orderId) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(orderId) });
    },
    onError: (error) => {
      window.alert(getErrorMessage(error, '주문 취소에 실패했습니다.'));
    },
  });
}
