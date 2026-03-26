'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { isApiError, ERROR_MESSAGES } from '@repo/types/guards';
import { useAuth } from '../model/auth-context';

export function SignupForm() {
  const router = useRouter();
  const { signup } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isValid = name.trim().length > 0 && email.includes('@') && password.length >= 8;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid || isSubmitting) return;

    setError('');
    setIsSubmitting(true);

    try {
      await signup({ email, password, name: name.trim() });
      router.push('/login');
    } catch (err) {
      if (isApiError(err)) {
        setError(ERROR_MESSAGES[err.code] ?? err.message ?? '회원가입에 실패했습니다.');
      } else {
        setError('회원가입에 실패했습니다.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <h1>회원가입</h1>

      {error && <p role="alert" style={{ color: 'red' }}>{error}</p>}

      <div>
        <label htmlFor="name">이름</label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="이름"
          required
          autoComplete="name"
        />
      </div>

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
          autoComplete="new-password"
        />
      </div>

      <button type="submit" disabled={!isValid || isSubmitting}>
        {isSubmitting ? '가입 중...' : '회원가입'}
      </button>

      <p>
        이미 계정이 있으신가요? <Link href="/login">로그인</Link>
      </p>
    </form>
  );
}
