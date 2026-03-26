import { apiClient } from '@/shared/config/api';
import { createProductApi } from '@repo/api-client';
import type { PaginatedResponse, ProductSummary, ProductListParams } from '@repo/types';

const productApi = createProductApi(apiClient);

export async function getProducts(
  params?: ProductListParams,
): Promise<PaginatedResponse<ProductSummary>> {
  return productApi.getProducts(params);
}
