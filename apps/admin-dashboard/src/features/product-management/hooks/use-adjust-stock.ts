import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getErrorMessage } from '@repo/types/guards';
import { adjustStock } from '../api/product-api';
import type { StockAdjustmentRequest } from '@repo/types';

export function useAdjustStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      data,
    }: {
      productId: string;
      data: StockAdjustmentRequest;
    }) => adjustStock(productId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      queryClient.invalidateQueries({
        queryKey: ['admin', 'products', variables.productId],
      });
    },
    onError: (error) => {
      window.alert(getErrorMessage(error, '재고 조정에 실패했습니다.'));
    },
  });
}
