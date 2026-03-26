'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { isApiError, ERROR_MESSAGES } from '@repo/types/guards';
import { useAuth } from '../model/auth-context';

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isValid = email.includes('@') && password.length >= 8;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid || isSubmitting) return;

    setError('');
    setIsSubmitting(true);

    try {
      await login({ email, password });
      router.push('/');
    } catch (err) {
      if (isApiError(err)) {
        setError(ERROR_MESSAGES[err.code] ?? err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('로그인에 실패했습니다.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <h1>로그인</h1>

      {error && <p role="alert" style={{ color: 'red' }}>{error}</p>}

      <div>
        <label htmlFor="email">이메일</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email@example.com"
          required
          autoComplete="email"
        />
      </div>

      <div>
        <label htmlFor="password">비밀번호</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="8자 이상"
          required
          minLength={8}
          autoComplete="current-password"
        />
      </div>

      <button type="submit" disabled={!isValid || isSubmitting}>
        {isSubmitting ? '로그인 중...' : '로그인'}
      </button>

      <p>
        계정이 없으신가요? <Link href="/signup">회원가입</Link>
      </p>
    </form>
  );
}
