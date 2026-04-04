import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addVariant, updateVariant, deleteVariant } from '../api/product-api';
import { productKeys } from './query-keys';

export function useAddVariant(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { optionName: string; stock: number; additionalPrice: number }) =>
      addVariant(productId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.detail(productId) });
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
  });
}

export function useUpdateVariant(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ variantId, data }: { variantId: string; data: { optionName: string; additionalPrice: number } }) =>
      updateVariant(productId, variantId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.detail(productId) });
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
  });
}

export function useDeleteVariant(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variantId: string) => deleteVariant(productId, variantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.detail(productId) });
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
  });
}
