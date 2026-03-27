'use client';

import { LoginForm, useRedirectIfAuthenticated } from '@/features/auth';

export default function LoginPage() {
  const { isReady } = useRedirectIfAuthenticated();

  if (!isReady) return null;

  return (
    <main style={{ maxWidth: '400px', margin: '4rem auto', padding: '0 1rem' }}>
      <LoginForm />
    </main>
  );
}
