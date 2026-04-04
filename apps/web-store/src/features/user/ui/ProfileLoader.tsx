'use client';

import { useEffect, useState, useCallback } from 'react';
import type { UserProfile } from '@repo/types';
import { ErrorMessage } from '@repo/ui';
import { Skeleton } from '@/shared/ui/Skeleton';
import { ProfileForm } from './ProfileForm';
import { getMyProfile } from '../api/user-profile-api';
import { useProfileImage } from '@/shared/context/ProfileImageContext';

export function ProfileLoader() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { setImageUrl: setGlobalProfileImage } = useProfileImage();

  const loadProfile = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await getMyProfile();
      setProfile(data);
      setGlobalProfileImage(data.profileImageUrl ?? '');
    } catch (err) {
      const apiErr = err as { code?: string };
      if (apiErr.code === 'USER_PROFILE_NOT_FOUND') {
        setError('프로필을 찾을 수 없습니다.');
      } else {
        setError('프로필을 불러오는데 실패했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  return (
    <div>
      <h1 className="page-title">내 프로필</h1>

      {isLoading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
            <Skeleton width="80px" height="80px" borderRadius="var(--radius-full)" />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <Skeleton width="40%" height="16px" />
              <Skeleton width="60%" height="14px" />
            </div>
          </div>
          <Skeleton width="100%" height="40px" />
          <Skeleton width="100%" height="40px" />
          <Skeleton width="100%" height="40px" />
        </div>
      )}
      {error && <ErrorMessage message={error} onRetry={loadProfile} />}
      {!isLoading && !error && profile && (
        <ProfileForm
          profile={profile}
          onUpdated={(updated) => setProfile(updated)}
        />
      )}
    </div>
  );
}
