import { apiClient } from '@/shared/config/api';
import { createAdminUserApi } from '@repo/api-client';
import type {
  PaginatedResponse,
  AdminUserSummary,
  AdminUserDetail,
  AdminUserListParams,
} from '@repo/types';

const adminUserApi = createAdminUserApi(apiClient);

export async function getUsers(
  params?: AdminUserListParams,
): Promise<PaginatedResponse<AdminUserSummary>> {
  return adminUserApi.getUsers(params);
}

export async function getUser(userId: string): Promise<AdminUserDetail> {
  return adminUserApi.getUser(userId);
}
