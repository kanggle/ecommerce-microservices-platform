'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import type { CategoryFacet, PriceRangeFacet } from '@repo/types';

interface SearchFiltersProps {
  categories?: CategoryFacet[];
  priceRanges?: PriceRangeFacet[];
}

export function SearchFilters({ categories, priceRanges }: SearchFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateParam(key: string, value: string | undefined) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete('page');
    router.push(`/products?${params.toString()}`);
  }

  const currentCategoryId = searchParams.get('categoryId') ?? undefined;
  const currentSort = searchParams.get('sort') ?? 'relevance';

  return (
    <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', alignItems: 'center' }}>
      {categories && categories.length > 0 && (
        <select
          aria-label="카테고리 필터"
          value={currentCategoryId ?? ''}
          onChange={(e) => updateParam('categoryId', e.target.value || undefined)}
          className="input"
          style={{ width: 'auto', padding: 'var(--space-2) var(--space-3)' }}
        >
          <option value="">전체 카테고리</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name} ({cat.count})
            </option>
          ))}
        </select>
      )}

      {priceRanges && priceRanges.length > 0 && (
        <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
          {priceRanges.map((range) => (
            <button
              key={`${range.min}-${range.max}`}
              onClick={() => {
                const params = new URLSearchParams(searchParams.toString());
                params.set('minPrice', String(range.min));
                params.set('maxPrice', String(range.max));
                params.delete('page');
                router.push(`/products?${params.toString()}`);
              }}
              className="btn"
              style={{ fontSize: 'var(--font-size-xs)', padding: 'var(--space-1) var(--space-2)' }}
            >
              {range.min.toLocaleString()}~{range.max.toLocaleString()}원 ({range.count})
            </button>
          ))}
        </div>
      )}

      <select
        aria-label="정렬 기준"
        value={currentSort}
        onChange={(e) => updateParam('sort', e.target.value)}
        className="input"
        style={{ width: 'auto', padding: 'var(--space-2) var(--space-3)' }}
      >
        <option value="relevance">관련도순</option>
        <option value="price_asc">낮은 가격순</option>
        <option value="price_desc">높은 가격순</option>
        <option value="newest">최신순</option>
      </select>
    </div>
  );
}
