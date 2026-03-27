import { useQuery } from '@tanstack/react-query';
import { getOrders } from '../api/order-api';
import { useListParams } from '../../../shared/hooks';
import type { OrderStatus } from '@repo/types';

const VALID_STATUSES: OrderStatus[] = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

function toOrderStatus(value: string | null): OrderStatus | undefined {
  if (!value) return undefined;
  return VALID_STATUSES.includes(value as OrderStatus) ? (value as OrderStatus) : undefined;
}

export function useOrders() {
  const { page, getParam, setFilter, buildPagination } = useListParams();

  const status = toOrderStatus(getParam('status'));

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
