import type { ApiClient } from '../client';
import type {
  PaginatedResponse,
  ProductSummary,
  ProductDetail,
  ProductListParams,
  CreateProductRequest,
  CreateProductResponse,
  UpdateProductRequest,
  StockAdjustmentRequest,
  StockAdjustmentResponse,
} from '@repo/types';

export function createProductApi(client: ApiClient) {
  return {
    getProducts: (params?: ProductListParams) =>
      client.get<PaginatedResponse<ProductSummary>>('/api/products', {
        params,
      }),

    getProduct: (productId: string) =>
      client.get<ProductDetail>(`/api/products/${productId}`),

    createProduct: (data: CreateProductRequest) =>
      client.post<CreateProductResponse>('/api/admin/products', data),

    updateProduct: (productId: string, data: UpdateProductRequest) =>
      client.patch<CreateProductResponse>(
        `/api/admin/products/${productId}`,
        data,
      ),

    adjustStock: (productId: string, data: StockAdjustmentRequest) =>
      client.patch<StockAdjustmentResponse>(
        `/api/admin/products/${productId}/stock`,
        data,
      ),

    addVariant: (productId: string, data: { optionName: string; stock: number; additionalPrice: number }) =>
      client.post<{ id: string; optionName: string; stock: number; additionalPrice: number }>(
        `/api/admin/products/${productId}/variants`,
        data,
      ),

    updateVariant: (productId: string, variantId: string, data: { optionName: string; additionalPrice: number }) =>
      client.patch<{ id: string; optionName: string; stock: number; additionalPrice: number }>(
        `/api/admin/products/${productId}/variants/${variantId}`,
        data,
      ),

    deleteVariant: (productId: string, variantId: string) =>
      client.delete<void>(`/api/admin/products/${productId}/variants/${variantId}`),
  };
}
