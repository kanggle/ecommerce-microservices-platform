import { apiClient } from '@/shared/config/api';
import { createUserApi } from '@repo/api-client';
import type {
  UserProfile,
  UpdateUserProfileRequest,
  UpdateUserProfileResponse,
} from '@repo/types';

const userApi = createUserApi(apiClient);

export async function getMyProfile(): Promise<UserProfile> {
  return userApi.getMe();
}

export async function updateMyProfile(
  data: UpdateUserProfileRequest,
): Promise<UpdateUserProfileResponse> {
  return userApi.updateMe(data);
}
