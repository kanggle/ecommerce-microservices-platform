import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adjustStock } from '../api/product-api';
import { productKeys } from './query-keys';
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
      queryClient.invalidateQueries({ queryKey: productKeys.all });
      queryClient.invalidateQueries({
        queryKey: productKeys.detail(variables.productId),
      });
    },
  });
}
