'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/shared/hooks';
import { isApiErrorResponse, getErrorMessage, ERROR_MESSAGES } from '@repo/types/guards';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(
    searchParams.get('error') === 'oauth_failed'
      ? 'Google 로그인에 실패했습니다. 다시 시도해 주세요.'
      : '',
  );
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
        backgroundColor: '#f5f5f5',
      }}
    >
      <form
        onSubmit={handleSubmit}
        noValidate
        style={{
          backgroundColor: '#fff',
          padding: '40px',
          borderRadius: '16px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
          width: '100%',
          maxWidth: '420px',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827', marginBottom: '8px', letterSpacing: '-0.02em' }}>
            <span style={{ color: '#1A1A2E' }}>Admin</span> Login
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#9ca3af', margin: 0 }}>
            관리자 계정으로 로그인하세요
          </p>
        </div>

        {error && (
          <div
            role="alert"
            style={{
              color: '#333',
              backgroundColor: '#f5f5f5',
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '10px 14px',
              marginBottom: '20px',
              textAlign: 'center',
              fontSize: '0.8125rem',
            }}
          >
            {error}
          </div>
        )}

        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="email" style={{ display: 'block', marginBottom: '6px', fontWeight: 500, fontSize: '0.875rem', color: '#374151' }}>
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
              padding: '11px 14px',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxSizing: 'border-box',
              fontSize: '0.875rem',
              backgroundColor: '#f9fafb',
              outline: 'none',
              transition: 'border-color 0.15s',
            }}
          />
        </div>

        <div style={{ marginBottom: '28px' }}>
          <label htmlFor="password" style={{ display: 'block', marginBottom: '6px', fontWeight: 500, fontSize: '0.875rem', color: '#374151' }}>
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
              padding: '11px 14px',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxSizing: 'border-box',
              fontSize: '0.875rem',
              backgroundColor: '#f9fafb',
              outline: 'none',
              transition: 'border-color 0.15s',
            }}
          />
        </div>

        <button
          type="submit"
          disabled={!isValid || isSubmitting}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: '#1A1A2E',
            color: '#fff',
            fontWeight: 600,
            fontSize: '0.9375rem',
            cursor: isValid && !isSubmitting ? 'pointer' : 'not-allowed',
            opacity: isValid && !isSubmitting ? 1 : 0.5,
            transition: 'opacity 0.15s',
          }}
        >
          {isSubmitting ? '로그인 중...' : '로그인'}
        </button>
      </form>
    </main>
  );
}
