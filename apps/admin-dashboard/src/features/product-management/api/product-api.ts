import { apiClient } from '@/shared/config/api';
import { createProductApi } from '@repo/api-client';
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

const productApi = createProductApi(apiClient);

export async function getProducts(
  params?: ProductListParams,
): Promise<PaginatedResponse<ProductSummary>> {
  return productApi.getProducts(params);
}

export async function getProduct(productId: string): Promise<ProductDetail> {
  return productApi.getProduct(productId);
}

export async function createProduct(
  data: CreateProductRequest,
): Promise<CreateProductResponse> {
  return productApi.createProduct(data);
}

export async function updateProduct(
  productId: string,
  data: UpdateProductRequest,
): Promise<CreateProductResponse> {
  return productApi.updateProduct(productId, data);
}

export async function adjustStock(
  productId: string,
  data: StockAdjustmentRequest,
): Promise<StockAdjustmentResponse> {
  return productApi.adjustStock(productId, data);
}
