import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createProduct } from '../api/product-api';
import { productKeys } from './query-keys';
import { alertError } from '@/shared/lib/alert-error';

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
    onError: (error: unknown) => {
      alertError(error, '상품 생성에 실패했습니다.');
    },
  });
}
