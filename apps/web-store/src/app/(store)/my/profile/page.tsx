'use client';

import { useRequireAuth } from '@/features/auth';
import { ProfileLoader } from '@/features/user';

export default function ProfilePage() {
  const { isReady } = useRequireAuth();

  if (!isReady) return null;

  return <ProfileLoader />;
}
