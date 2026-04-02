'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import styles from './SearchBar.module.css';

export function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') ?? '');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    const params = new URLSearchParams();
    params.set('q', trimmed);
    router.push(`/products?${params.toString()}`);
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.inputWrap}>
        <span className={styles.icon} aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </span>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="상품을 검색하세요"
          aria-label="상품 검색"
          className={styles.input}
        />
      </div>
      <button
        type="submit"
        aria-label="검색"
        className={styles.button}
      >
        검색
      </button>
    </form>
  );
}
