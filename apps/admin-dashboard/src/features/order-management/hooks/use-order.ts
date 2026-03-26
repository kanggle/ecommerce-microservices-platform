import { useQuery } from '@tanstack/react-query';
import { getOrder } from '../api/order-api';

export function useOrder(orderId: string) {
  return useQuery({
    queryKey: ['admin', 'orders', orderId],
    queryFn: () => getOrder(orderId),
    enabled: !!orderId,
  });
}
