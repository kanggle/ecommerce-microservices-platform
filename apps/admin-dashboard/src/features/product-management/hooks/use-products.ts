import { useQuery } from '@tanstack/react-query';
import { getProducts } from '../api/product-api';
import { useListParams } from '../../../shared/hooks';
import { toValidStatus } from '../../../shared/lib/to-valid-status';
import type { ProductStatus } from '@repo/types';

const VALID_STATUSES: readonly ProductStatus[] = ['ON_SALE', 'SOLD_OUT', 'HIDDEN'] as const;

export function useProducts() {
  const { page, getParam, setFilter, buildPagination } = useListParams();

  const status = toValidStatus(getParam('status'), VALID_STATUSES);
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
