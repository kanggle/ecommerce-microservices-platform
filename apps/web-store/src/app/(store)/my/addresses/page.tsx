'use client';

import { useRequireAuth } from '@/features/auth';
import { AddressManager } from '@/features/user';

export default function AddressesPage() {
  const { isReady } = useRequireAuth();

  if (!isReady) return null;

  return <AddressManager />;
}
