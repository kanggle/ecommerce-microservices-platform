import { useQuery } from '@tanstack/react-query';
import { getProducts } from '../api/product-api';
import { useListParams } from '../../../shared/hooks';
import type { ProductStatus } from '@repo/types';

const VALID_STATUSES: ProductStatus[] = ['ON_SALE', 'SOLD_OUT', 'HIDDEN'];

function toProductStatus(value: string | null): ProductStatus | undefined {
  if (!value) return undefined;
  return VALID_STATUSES.includes(value as ProductStatus) ? (value as ProductStatus) : undefined;
}

export function useProducts() {
  const { page, getParam, setFilter, buildPagination } = useListParams();

  const status = toProductStatus(getParam('status'));
  const name = getParam('name') || undefined;

  const query = useQuery({
    queryKey: ['admin', 'products', { page, status, name }],
    queryFn: () => getProducts({ page, status, name }),
  });

  return {
    ...query,
    pagination: buildPagination(query.data),
    filters: { status, name, setFilter },
  };
}
