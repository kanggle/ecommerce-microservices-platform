'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import styles from './HeroBanner.module.css';

interface Slide {
  id: string;
  title: string;
  subtitle: string;
  cta: string;
  href: string;
  bg: string;
}

const SLIDES: Slide[] = [
  {
    id: '1',
    title: '당신에게 딱 맞는 상품을 찾아보세요',
    subtitle: '합리적인 가격, 빠른 배송. 최고의 쇼핑 경험을 제공합니다.',
    cta: '전체 상품 보기',
    href: '/products',
    bg: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
  },
  {
    id: '2',
    title: '신상품이 도착했습니다',
    subtitle: '이번 시즌 새로운 컬렉션을 만나보세요.',
    cta: '신상품 보기',
    href: '/products',
    bg: 'linear-gradient(135deg, #0f3460 0%, #16213e 100%)',
  },
  {
    id: '3',
    title: '특별 할인 진행 중',
    subtitle: '인기 상품을 합리적인 가격에 만나보세요.',
    cta: '할인 상품 보기',
    href: '/products',
    bg: 'linear-gradient(135deg, #e94560 0%, #0f3460 100%)',
  },
];

const AUTO_PLAY_MS = 5000;

export function HeroBanner() {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const total = SLIDES.length;

  const goTo = useCallback((index: number) => {
    setCurrent(index);
  }, []);

  const next = useCallback(() => {
    setCurrent((i) => (i + 1) % total);
  }, [total]);

  const prev = useCallback(() => {
    setCurrent((i) => (i - 1 + total) % total);
  }, [total]);

  useEffect(() => {
    timerRef.current = setInterval(next, AUTO_PLAY_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [next]);

  const slide = SLIDES[current];

  return (
    <section className={styles.banner}>
      <div className={styles.slide} style={{ background: slide.bg }}>
        <div className={styles.inner}>
          <h1 className={styles.title}>{slide.title}</h1>
          <p className={styles.subtitle}>{slide.subtitle}</p>
          <Link href={slide.href} className={styles.cta}>
            {slide.cta}
          </Link>
        </div>

        <button type="button" className={`${styles.arrow} ${styles.arrowPrev}`} onClick={prev} aria-label="이전 슬라이드">
          ‹
        </button>
        <button type="button" className={`${styles.arrow} ${styles.arrowNext}`} onClick={next} aria-label="다음 슬라이드">
          ›
        </button>

        <div className={styles.dots}>
          {SLIDES.map((s, i) => (
            <button
              key={s.id}
              type="button"
              className={`${styles.dot} ${i === current ? styles.dotActive : ''}`}
              onClick={() => goTo(i)}
              aria-label={`슬라이드 ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
