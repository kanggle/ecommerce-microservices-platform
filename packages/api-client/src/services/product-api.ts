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
  };
}
