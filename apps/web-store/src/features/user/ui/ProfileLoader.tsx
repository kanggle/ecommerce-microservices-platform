'use client';

import { useEffect, useState, useCallback } from 'react';
import type { UserProfile } from '@repo/types';
import { LoadingSpinner, ErrorMessage } from '@repo/ui';
import { ProfileForm } from './ProfileForm';
import { getMyProfile } from '../api/user-profile-api';

export function ProfileLoader() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadProfile = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await getMyProfile();
      setProfile(data);
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
    <div className="container" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)', maxWidth: '600px' }}>
      <h1 className="page-title">내 프로필</h1>

      {isLoading && <LoadingSpinner />}
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
