import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockGetMe, mockUpdateMe } = vi.hoisted(() => ({
  mockGetMe: vi.fn(),
  mockUpdateMe: vi.fn(),
}));

vi.mock('@/shared/config/api', () => ({
  apiClient: {},
}));

vi.mock('@repo/api-client', () => ({
  createUserApi: vi.fn(() => ({
    getMe: mockGetMe,
    updateMe: mockUpdateMe,
  })),
}));

describe('user-profile-api', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    // 모듈을 매번 새로 로드하여 mockProfile 상태를 초기화한다
    vi.resetModules();
  });

  async function loadModule() {
    const mod = await import('@/features/user/api/user-profile-api');
    return mod;
  }

  describe('getMyProfile', () => {
    it('API에서 사용자 프로필을 정상적으로 조회한다', async () => {
      const profile = {
        userId: 'user-1',
        email: 'user@example.com',
        name: '홍길동',
        nickname: '길동이',
        phone: '010-1234-5678',
        profileImageUrl: null,
        status: 'ACTIVE',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      };
      mockGetMe.mockResolvedValueOnce(profile);

      const { getMyProfile } = await loadModule();
      const result = await getMyProfile();

      expect(mockGetMe).toHaveBeenCalled();
      expect(result).toEqual(profile);
    });

    it('API 에러 시 폴백 프로필을 반환한다', async () => {
      mockGetMe.mockRejectedValueOnce(new Error('Unauthorized'));

      const { getMyProfile } = await loadModule();
      const result = await getMyProfile();

      expect(result.userId).toBe('mock-user');
      expect(result.email).toBe('test@example.com');
      expect(result.name).toBe('테스트유저');
      expect(result.status).toBe('ACTIVE');
    });

    it('API 성공 후 다시 에러 발생 시 캐시된 프로필을 반환한다', async () => {
      const profile = {
        userId: 'user-1',
        email: 'user@example.com',
        name: '홍길동',
        nickname: null,
        phone: null,
        profileImageUrl: null,
        status: 'ACTIVE',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      };
      mockGetMe.mockResolvedValueOnce(profile);
      mockGetMe.mockRejectedValueOnce(new Error('Server error'));

      const { getMyProfile } = await loadModule();

      // 첫 호출: API 성공으로 캐시 저장
      const first = await getMyProfile();
      expect(first.userId).toBe('user-1');

      // 두 번째 호출: API 에러지만 캐시된 프로필 반환
      const second = await getMyProfile();
      expect(second.userId).toBe('user-1');
      expect(second.name).toBe('홍길동');
    });
  });

  describe('updateMyProfile', () => {
    it('API를 통해 프로필을 정상적으로 업데이트한다', async () => {
      const updateData = { nickname: '새닉네임', phone: '010-9999-8888', profileImageUrl: null };
      const response = {
        userId: 'user-1',
        email: 'user@example.com',
        name: '홍길동',
        nickname: '새닉네임',
        phone: '010-9999-8888',
        profileImageUrl: null,
        status: 'ACTIVE',
        updatedAt: '2026-04-05T00:00:00Z',
      };
      mockUpdateMe.mockResolvedValueOnce(response);

      const { updateMyProfile } = await loadModule();
      const result = await updateMyProfile(updateData);

      expect(mockUpdateMe).toHaveBeenCalledWith(updateData);
      expect(result).toEqual(response);
    });

    it('API 에러 시 요청 데이터를 기반으로 폴백 응답을 반환한다', async () => {
      mockUpdateMe.mockRejectedValueOnce(new Error('Server error'));

      const { updateMyProfile } = await loadModule();
      const result = await updateMyProfile({
        nickname: '오프라인닉네임',
        phone: '010-0000-0000',
        profileImageUrl: 'img.jpg',
      });

      expect(result.userId).toBe('mock-user');
      expect(result.nickname).toBe('오프라인닉네임');
      expect(result.phone).toBe('010-0000-0000');
      expect(result.profileImageUrl).toBe('img.jpg');
      expect(result.status).toBe('ACTIVE');
    });

    it('API 에러 시 이전에 캐시된 프로필 정보를 폴백에 활용한다', async () => {
      const profile = {
        userId: 'user-1',
        email: 'real@example.com',
        name: '실제유저',
        nickname: '기존닉네임',
        phone: '010-1111-2222',
        profileImageUrl: null,
        status: 'ACTIVE',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      };
      mockGetMe.mockResolvedValueOnce(profile);
      mockUpdateMe.mockRejectedValueOnce(new Error('Server error'));

      const { getMyProfile, updateMyProfile } = await loadModule();

      // getMyProfile로 캐시 설정
      await getMyProfile();

      // updateMyProfile 에러 시 캐시된 userId/email 사용
      const result = await updateMyProfile({ nickname: '변경닉네임', phone: null, profileImageUrl: null });

      expect(result.userId).toBe('user-1');
      expect(result.email).toBe('real@example.com');
      expect(result.name).toBe('실제유저');
      expect(result.nickname).toBe('변경닉네임');
    });
  });
});
