import { apiClient } from '@/shared/config/api';
import { createOrderApi } from '@repo/api-client';
import type {
  PaginatedResponse,
  OrderListParams,
  OrderSummary,
  OrderDetail,
  CancelOrderResponse,
} from '@repo/types';

const orderApi = createOrderApi(apiClient);

export async function getOrders(
  params?: OrderListParams,
): Promise<PaginatedResponse<OrderSummary>> {
  return orderApi.getOrders(params);
}

export async function getOrder(orderId: string): Promise<OrderDetail> {
  return orderApi.getOrder(orderId);
}

export async function cancelOrder(orderId: string): Promise<CancelOrderResponse> {
  return orderApi.cancelOrder(orderId);
}
