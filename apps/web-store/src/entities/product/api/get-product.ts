import { apiClient } from '@/shared/config/api';
import { createProductApi } from '@repo/api-client';
import type { ProductDetail } from '@repo/types';
import { MOCK_PRODUCTS, fallbackImages } from './mock-data';

const productApi = createProductApi(apiClient);

export async function getProduct(id: string): Promise<ProductDetail | null> {
  try {
    const product = await productApi.getProduct(id);
    if (!product) return null;
    if (!product.images?.length) {
      product.images = fallbackImages(product.name);
    }
    return product;
  } catch {
    return MOCK_PRODUCTS.find((p) => p.id === id) ?? null;
  }
}
