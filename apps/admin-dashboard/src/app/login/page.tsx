'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/shared/hooks';
import { isApiErrorResponse, getErrorMessage, ERROR_MESSAGES } from '@repo/types/guards';

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || isAuthenticated) return null;

  const isValid = email.includes('@') && password.length >= 8;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid || isSubmitting) return;

    setError('');
    setIsSubmitting(true);

    try {
      await login({ email, password });
      router.push('/dashboard');
    } catch (err) {
      if (isApiErrorResponse(err)) {
        setError(ERROR_MESSAGES[err.code] ?? err.message);
      } else {
        setError(getErrorMessage(err, '로그인에 실패했습니다.'));
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#f9fafb',
      }}
    >
      <form
        onSubmit={handleSubmit}
        noValidate
        style={{
          backgroundColor: '#fff',
          padding: '32px',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          width: '100%',
          maxWidth: '400px',
        }}
      >
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '24px', textAlign: 'center' }}>
          Admin 로그인
        </h1>

        {error && (
          <p role="alert" style={{ color: 'red', marginBottom: '16px', textAlign: 'center' }}>
            {error}
          </p>
        )}

        <div style={{ marginBottom: '16px' }}>
          <label htmlFor="email" style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>
            이메일
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com"
            required
            autoComplete="email"
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label htmlFor="password" style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>
            비밀번호
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="8자 이상"
            required
            minLength={8}
            autoComplete="current-password"
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <button
          type="submit"
          disabled={!isValid || isSubmitting}
          style={{
            width: '100%',
            padding: '10px',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: '#2563eb',
            color: '#fff',
            fontWeight: 600,
            cursor: isValid && !isSubmitting ? 'pointer' : 'not-allowed',
            opacity: isValid && !isSubmitting ? 1 : 0.5,
          }}
        >
          {isSubmitting ? '로그인 중...' : '로그인'}
        </button>
      </form>
    </main>
  );
}
