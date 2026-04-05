import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createProduct } from '../api/product-api';
import { productKeys } from './query-keys';
import { getErrorMessage } from '@repo/types/guards';

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
    onError: (error: unknown) => {
      window.alert(getErrorMessage(error, '상품 생성에 실패했습니다.'));
    },
  });
}
