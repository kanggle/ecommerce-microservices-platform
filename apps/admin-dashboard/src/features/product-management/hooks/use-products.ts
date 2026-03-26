import { useQuery } from '@tanstack/react-query';
import { useSearchParams, useRouter } from 'next/navigation';
import { getProducts } from '../api/product-api';
import type { ProductStatus } from '@repo/types';

const VALID_STATUSES: ProductStatus[] = ['ON_SALE', 'SOLD_OUT', 'HIDDEN'];

function toProductStatus(value: string | null): ProductStatus | undefined {
  if (!value) return undefined;
  return VALID_STATUSES.includes(value as ProductStatus) ? (value as ProductStatus) : undefined;
}

export function useProducts() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const page = Number(searchParams.get('page') ?? '0');
  const status = toProductStatus(searchParams.get('status'));
  const name = searchParams.get('name') || undefined;

  const query = useQuery({
    queryKey: ['admin', 'products', { page, status, name }],
    queryFn: () => getProducts({ page, status, name }),
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
    filters: { status, name, setFilter },
  };
}
