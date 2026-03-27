import { useQuery } from '@tanstack/react-query';
import { getOrders } from '../api/order-api';
import { useListParams } from '../../../shared/hooks';
import { toValidStatus } from '../../../shared/lib/to-valid-status';
import type { OrderStatus } from '@repo/types';

const VALID_STATUSES: readonly OrderStatus[] = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as const;

export function useOrders() {
  const { page, getParam, setFilter, buildPagination } = useListParams();

  const status = toValidStatus(getParam('status'), VALID_STATUSES);

  const query = useQuery({
    queryKey: ['admin', 'orders', { page, status }],
    queryFn: () => getOrders({ page, ...(status && { status }) }),
  });

  return {
    ...query,
    pagination: buildPagination(query.data),
    filters: { status, setFilter },
  };
}
