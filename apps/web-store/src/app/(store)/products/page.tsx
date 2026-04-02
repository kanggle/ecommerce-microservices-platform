export const revalidate = 60;

import { Suspense } from 'react';
import { getProducts } from '@/entities/product';
import { searchProducts, SearchBar, SearchFilters, SearchResults } from '@/features/search';
import { ProductList } from '@/features/product';
import { Pagination } from '@/shared/ui';
import { ErrorMessage, LoadingSpinner } from '@repo/ui';
import type { SearchSortOrder } from '@repo/types';

interface Props {
  searchParams: Promise<{
    q?: string;
    categoryId?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
    page?: string;
    size?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Number(params.page ?? '0');
  const size = Number(params.size ?? '20');
  const query = params.q?.trim();

  const searchResult = query
    ? await searchProducts({
        q: query,
        categoryId: params.categoryId,
        minPrice: params.minPrice ? Number(params.minPrice) : undefined,
        maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
        sort: (params.sort as SearchSortOrder) ?? 'relevance',
        page,
        size,
      }).catch(() => null)
    : null;

  if (searchResult) {
    return (
      <div className="container" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <Suspense fallback={<LoadingSpinner />}><SearchBar /></Suspense>
        </div>
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <Suspense fallback={<LoadingSpinner />}>
            <SearchFilters categories={searchResult.facets.categories} priceRanges={searchResult.facets.priceRanges} />
          </Suspense>
        </div>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)', fontSize: 'var(--font-size-sm)' }}>
          &quot;{searchResult.query}&quot; 검색 결과 {searchResult.totalElements}건
        </p>
        <SearchResults items={searchResult.content} query={searchResult.query} />
        <div style={{ marginTop: 'var(--space-8)' }}>
          <Pagination currentPage={searchResult.page} totalElements={searchResult.totalElements} pageSize={searchResult.size} baseHref="/products" searchParams={params as Record<string, string>} />
        </div>
      </div>
    );
  }

  const searchFailed = !!query && !searchResult;

  try {
    const result = await getProducts({ categoryId: params.categoryId, page, size });

    return (
      <div className="container" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <Suspense fallback={<LoadingSpinner />}><SearchBar /></Suspense>
        </div>
        {searchFailed && (
          <div
            style={{
              padding: 'var(--space-3) var(--space-4)',
              marginBottom: 'var(--space-4)',
              backgroundColor: '#fff3cd',
              border: '1px solid #ffc107',
              borderRadius: 'var(--radius-md)',
              color: '#856404',
              fontSize: 'var(--font-size-sm)',
            }}
          >
            검색을 사용할 수 없어 전체 상품을 표시합니다.
          </div>
        )}
        <h1 className="page-title">전체 상품</h1>
        <ProductList products={result.content} />
        <div style={{ marginTop: 'var(--space-8)' }}>
          <Pagination currentPage={result.page} totalElements={result.totalElements} pageSize={result.size} baseHref="/products" searchParams={params as Record<string, string>} />
        </div>
      </div>
    );
  } catch {
    return (
      <div className="container" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
        <Suspense fallback={<LoadingSpinner />}><SearchBar /></Suspense>
        <ErrorMessage message="상품 목록을 불러오는 데 실패했습니다." />
      </div>
    );
  }
}
