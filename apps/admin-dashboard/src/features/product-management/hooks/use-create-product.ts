import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createProduct } from '../api/product-api';
import { productKeys } from './query-keys';

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
  });
}
