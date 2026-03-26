import { useQuery } from '@tanstack/react-query';
import { getProduct } from '../api/product-api';

export function useProduct(productId: string) {
  return useQuery({
    queryKey: ['admin', 'products', productId],
    queryFn: () => getProduct(productId),
    enabled: !!productId,
  });
}
