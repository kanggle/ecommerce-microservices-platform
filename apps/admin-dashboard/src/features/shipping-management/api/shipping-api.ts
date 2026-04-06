import { apiClient } from '@/shared/config/api';
import { createAdminShippingApi } from '@repo/api-client';
import type {
  PaginatedResponse,
  ShippingListParams,
  ShippingSummary,
  UpdateShippingStatusRequest,
  UpdateShippingStatusResponse,
} from '@repo/types';

const adminShippingApi = createAdminShippingApi(apiClient);

export async function getShippings(
  params?: ShippingListParams,
): Promise<PaginatedResponse<ShippingSummary>> {
  return adminShippingApi.getShippings(params);
}

export async function updateShippingStatus(
  shippingId: string,
  data: UpdateShippingStatusRequest,
): Promise<UpdateShippingStatusResponse> {
  return adminShippingApi.updateStatus(shippingId, data);
}
