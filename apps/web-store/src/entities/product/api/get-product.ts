import { apiClient } from '@/shared/config/api';
import { createProductApi } from '@repo/api-client';
import type { ProductDetail } from '@repo/types';

const productApi = createProductApi(apiClient);

export async function getProduct(id: string): Promise<ProductDetail | null> {
  try {
    return await productApi.getProduct(id);
  } catch {
    return null;
  }
}
