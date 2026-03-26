'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SignupForm, useAuth } from '@/features/auth';

export default function SignupPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || isAuthenticated) return null;

  return (
    <main style={{ maxWidth: '400px', margin: '4rem auto', padding: '0 1rem' }}>
      <SignupForm />
    </main>
  );
}
