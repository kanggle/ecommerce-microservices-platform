import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateProduct } from '../api/product-api';
import { productKeys } from './query-keys';
import { alertError } from '@/shared/lib/alert-error';
import type { UpdateProductRequest } from '@repo/types';

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, data }: { productId: string; data: UpdateProductRequest }) =>
      updateProduct(productId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
      queryClient.invalidateQueries({
        queryKey: productKeys.detail(variables.productId),
      });
    },
    onError: (error: unknown) => {
      alertError(error, '상품 수정에 실패했습니다.');
    },
  });
}
