import { apiClient } from '@/shared/config/api';
import { createUserApi } from '@repo/api-client';
import type {
  UserProfile,
  UpdateUserProfileRequest,
  UpdateUserProfileResponse,
} from '@repo/types';

const userApi = createUserApi(apiClient);

let mockProfile: UserProfile | null = null;

export async function getMyProfile(): Promise<UserProfile> {
  try {
    const profile = await userApi.getMe();
    mockProfile = profile;
    return profile;
  } catch {
    if (mockProfile) return mockProfile;
    const fallback: UserProfile = {
      userId: 'mock-user',
      email: 'test@example.com',
      name: '테스트유저',
      nickname: null,
      phone: null,
      profileImageUrl: null,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockProfile = fallback;
    return fallback;
  }
}

export async function updateMyProfile(
  data: UpdateUserProfileRequest,
): Promise<UpdateUserProfileResponse> {
  try {
    return await userApi.updateMe(data);
  } catch {
    const updated: UpdateUserProfileResponse = {
      userId: mockProfile?.userId ?? 'mock-user',
      email: mockProfile?.email ?? 'test@example.com',
      name: mockProfile?.name ?? '테스트유저',
      nickname: data.nickname ?? mockProfile?.nickname ?? null,
      phone: data.phone ?? mockProfile?.phone ?? null,
      profileImageUrl: data.profileImageUrl ?? mockProfile?.profileImageUrl ?? null,
      status: 'ACTIVE',
      updatedAt: new Date().toISOString(),
    };
    if (mockProfile) {
      mockProfile = { ...mockProfile, ...updated };
    }
    return updated;
  }
}
