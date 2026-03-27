import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getErrorMessage } from '@repo/types/guards';
import { createProduct } from '../api/product-api';
import { productKeys } from './query-keys';

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
    onError: (error) => {
      window.alert(getErrorMessage(error, '상품 등록에 실패했습니다.'));
    },
  });
}
