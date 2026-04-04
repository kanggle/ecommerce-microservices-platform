import { useMutation, useQueryClient } from '@tanstack/react-query';
import { changeOrderStatus } from '../api/order-api';
import { orderKeys } from './query-keys';
import type { OrderStatus } from '@repo/types';

export function useChangeOrderStatus(orderId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (status: OrderStatus) => changeOrderStatus(orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(orderId) });
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
    },
  });
}
