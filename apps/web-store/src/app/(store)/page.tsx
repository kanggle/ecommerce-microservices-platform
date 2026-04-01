import { Suspense } from 'react';
import { getProducts } from '@/entities/product';
import { SearchBar } from '@/features/search';
import { ProductList } from '@/features/product';
import { LoadingSpinner } from '@repo/ui';
import Link from 'next/link';
import type { ProductSummary } from '@repo/types';

export default async function HomePage() {
  const products: ProductSummary[] = await getProducts({ page: 0, size: 8 })
    .then((result) => result.content)
    .catch(() => []);

  return (
    <div>
      {/* Hero Section */}
      <section
        style={{
          background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%)',
          color: 'var(--color-text-inverse)',
          padding: 'var(--space-16) var(--space-6)',
          textAlign: 'center',
        }}
      >
        <div className="container">
          <h1
            style={{
              fontSize: 'var(--font-size-4xl)',
              fontWeight: 'var(--font-weight-bold)',
              marginBottom: 'var(--space-4)',
              lineHeight: 'var(--line-height-tight)',
            }}
          >
            당신에게 딱 맞는 상품을 찾아보세요
          </h1>
          <p
            style={{
              fontSize: 'var(--font-size-lg)',
              color: 'var(--color-text-muted)',
              marginBottom: 'var(--space-8)',
              maxWidth: '600px',
              margin: '0 auto var(--space-8)',
            }}
          >
            합리적인 가격, 빠른 배송. 최고의 쇼핑 경험을 제공합니다.
          </p>
          <div style={{ maxWidth: '560px', margin: '0 auto' }}>
            <Suspense fallback={<LoadingSpinner />}>
              <SearchBar />
            </Suspense>
          </div>
        </div>
      </section>

      {/* Popular Products */}
      <section className="container" style={{ padding: 'var(--space-12) var(--space-6)' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 'var(--space-6)',
          }}
        >
          <h2
            style={{
              fontSize: 'var(--font-size-2xl)',
              fontWeight: 'var(--font-weight-bold)',
              margin: 0,
            }}
          >
            인기 상품
          </h2>
          <Link
            href="/products"
            style={{
              color: 'var(--color-primary-hover)',
              fontWeight: 'var(--font-weight-semibold)',
              fontSize: 'var(--font-size-sm)',
            }}
          >
            전체보기 &rarr;
          </Link>
        </div>
        <ProductList products={products} />
      </section>
    </div>
  );
}
