import { apiClient } from '@/shared/config/api';
import { createAdminOrderApi } from '@repo/api-client';
import type {
  PaginatedResponse,
  OrderListParams,
  OrderStatus,
  AdminOrderSummary,
  AdminOrderDetail,
  AdminOrderStatusChangeResponse,
} from '@repo/types';

const adminOrderApi = createAdminOrderApi(apiClient);

export async function getOrders(
  params?: OrderListParams,
): Promise<PaginatedResponse<AdminOrderSummary>> {
  return adminOrderApi.getOrders(params);
}

export async function getOrder(orderId: string): Promise<AdminOrderDetail> {
  return adminOrderApi.getOrder(orderId);
}

export async function changeOrderStatus(orderId: string, status: OrderStatus): Promise<AdminOrderStatusChangeResponse> {
  return adminOrderApi.changeStatus(orderId, status);
}
