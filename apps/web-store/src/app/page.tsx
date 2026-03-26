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
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
      <h1 style={{ fontSize: '28px', marginBottom: '24px' }}>Web Store</h1>
      <div style={{ marginBottom: '32px' }}>
        <Suspense fallback={<LoadingSpinner />}>
          <SearchBar />
        </Suspense>
      </div>
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '20px', margin: 0 }}>인기 상품</h2>
          <Link href="/products" style={{ color: '#333' }}>
            전체보기
          </Link>
        </div>
        <ProductList products={products} />
      </section>
    </div>
  );
}
