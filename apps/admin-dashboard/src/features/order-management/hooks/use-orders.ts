import { useQuery } from '@tanstack/react-query';
import { useSearchParams, useRouter } from 'next/navigation';
import { getOrders } from '../api/order-api';
import type { OrderStatus } from '@repo/types';

const VALID_STATUSES: OrderStatus[] = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

function toOrderStatus(value: string | null): OrderStatus | undefined {
  if (!value) return undefined;
  return VALID_STATUSES.includes(value as OrderStatus) ? (value as OrderStatus) : undefined;
}

export function useOrders() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const page = Number(searchParams.get('page') ?? '0');
  const status = toOrderStatus(searchParams.get('status'));

  const query = useQuery({
    queryKey: ['admin', 'orders', { page, status }],
    queryFn: () => getOrders({ page, ...(status && { status }) }),
  });

  const setFilter = (key: string, value: string | undefined) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set('page', '0');
    router.push(`?${params.toString()}`);
  };

  const setPage = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(newPage));
    router.push(`?${params.toString()}`);
  };

  return {
    ...query,
    pagination: {
      page,
      totalPages: query.data
        ? Math.ceil(query.data.totalElements / (query.data.size || 20))
        : 0,
      onPageChange: setPage,
    },
    filters: { status, setFilter },
  };
}
