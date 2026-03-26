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

const styles = {
  container: { maxWidth: '1200px', margin: '0 auto', padding: '24px' } as const,
  searchSection: { marginBottom: '24px' } as const,
  filterSection: { marginBottom: '16px' } as const,
  resultCount: { color: '#666', marginBottom: '16px' } as const,
  paginationWrap: { marginTop: '24px' } as const,
  searchFallback: { padding: '12px 16px', marginBottom: '16px', backgroundColor: '#fff3cd', border: '1px solid #ffc107', borderRadius: '4px', color: '#856404' } as const,
  title: { fontSize: '24px', marginBottom: '24px' } as const,
};

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
      <div style={styles.container}>
        <div style={styles.searchSection}>
          <Suspense fallback={<LoadingSpinner />}><SearchBar /></Suspense>
        </div>
        <div style={styles.filterSection}>
          <Suspense fallback={<LoadingSpinner />}>
            <SearchFilters categories={searchResult.facets.categories} priceRanges={searchResult.facets.priceRanges} />
          </Suspense>
        </div>
        <p style={styles.resultCount}>
          &quot;{searchResult.query}&quot; 검색 결과 {searchResult.totalElements}건
        </p>
        <SearchResults items={searchResult.content} query={searchResult.query} />
        <div style={styles.paginationWrap}>
          <Pagination currentPage={searchResult.page} totalElements={searchResult.totalElements} pageSize={searchResult.size} baseHref="/products" searchParams={params as Record<string, string>} />
        </div>
      </div>
    );
  }

  const searchFailed = !!query && !searchResult;

  try {
    const result = await getProducts({ categoryId: params.categoryId, page, size });

    return (
      <div style={styles.container}>
        <div style={styles.searchSection}>
          <Suspense fallback={<LoadingSpinner />}><SearchBar /></Suspense>
        </div>
        {searchFailed && <div style={styles.searchFallback}>검색을 사용할 수 없어 전체 상품을 표시합니다.</div>}
        <h1 style={styles.title}>전체 상품</h1>
        <ProductList products={result.content} />
        <div style={styles.paginationWrap}>
          <Pagination currentPage={result.page} totalElements={result.totalElements} pageSize={result.size} baseHref="/products" searchParams={params as Record<string, string>} />
        </div>
      </div>
    );
  } catch {
    return (
      <div style={styles.container}>
        <Suspense fallback={<LoadingSpinner />}><SearchBar /></Suspense>
        <ErrorMessage message="상품 목록을 불러오는 데 실패했습니다." />
      </div>
    );
  }
}
