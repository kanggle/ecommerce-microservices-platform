'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { UserProfile } from '@repo/types';
import { useAuth } from '@/features/auth';
import { ProfileForm, getMyProfile } from '@/features/user';
import { LoadingSpinner, ErrorMessage } from '@repo/ui';

export default function ProfilePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [authLoading, isAuthenticated, router]);

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
    if (!authLoading && isAuthenticated) {
      loadProfile();
    }
  }, [authLoading, isAuthenticated, loadProfile]);

  if (authLoading || !isAuthenticated) return null;

  return (
    <main style={{ maxWidth: '600px', margin: '0 auto', padding: '24px' }}>
      <h1 style={{ marginBottom: '24px' }}>내 프로필</h1>

      {isLoading && <LoadingSpinner />}
      {error && <ErrorMessage message={error} onRetry={loadProfile} />}
      {!isLoading && !error && profile && (
        <ProfileForm
          profile={profile}
          onUpdated={(updated) => setProfile(updated)}
        />
      )}
    </main>
  );
}
