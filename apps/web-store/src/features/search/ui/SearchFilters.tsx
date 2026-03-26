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
    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
      {categories && categories.length > 0 && (
        <select
          aria-label="카테고리 필터"
          value={currentCategoryId ?? ''}
          onChange={(e) => updateParam('categoryId', e.target.value || undefined)}
          style={{ padding: '6px 10px', border: '1px solid #ddd', borderRadius: '4px' }}
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
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
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
              style={{
                padding: '4px 8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                fontSize: '12px',
              }}
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
        style={{ padding: '6px 10px', border: '1px solid #ddd', borderRadius: '4px' }}
      >
        <option value="relevance">관련도순</option>
        <option value="price_asc">낮은 가격순</option>
        <option value="price_desc">높은 가격순</option>
        <option value="newest">최신순</option>
      </select>
    </div>
  );
}
