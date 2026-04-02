import { apiClient } from '@/shared/config/api';
import { createProductApi } from '@repo/api-client';
import type { PaginatedResponse, ProductSummary, ProductListParams } from '@repo/types';
import { MOCK_PRODUCTS, toSummary, fallbackThumbnail } from './mock-data';

const productApi = createProductApi(apiClient);

export async function getProducts(
  params?: ProductListParams,
): Promise<PaginatedResponse<ProductSummary>> {
  try {
    const result = await productApi.getProducts(params);
    result.content = result.content.map((p) => ({
      ...p,
      thumbnailUrl: p.thumbnailUrl || fallbackThumbnail(p.name),
    }));
    return result;
  } catch {
    const page = params?.page ?? 0;
    const size = params?.size ?? 10;
    const all = MOCK_PRODUCTS.map(toSummary);
    const content = all.slice(page * size, page * size + size);
    return { content, page, size, totalElements: all.length };
  }
}
