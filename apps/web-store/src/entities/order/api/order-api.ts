import { apiClient } from '@/shared/config/api';
import { createOrderApi } from '@repo/api-client';
import type {
  PlaceOrderRequest,
  PlaceOrderResponse,
  OrderSummary,
  OrderDetail,
  CancelOrderResponse,
} from '@repo/types';
import type { PaginatedResponse } from '@repo/types';

const orderApi = createOrderApi(apiClient);

export async function placeOrder(data: PlaceOrderRequest): Promise<PlaceOrderResponse> {
  return orderApi.placeOrder(data);
}

export async function getOrders(page = 0, size = 20): Promise<PaginatedResponse<OrderSummary>> {
  return orderApi.getOrders({ page, size });
}

export async function getOrder(orderId: string): Promise<OrderDetail> {
  return orderApi.getOrder(orderId);
}

export async function cancelOrder(orderId: string): Promise<CancelOrderResponse> {
  return orderApi.cancelOrder(orderId);
}
