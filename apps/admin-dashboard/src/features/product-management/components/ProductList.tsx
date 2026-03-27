'use client';

import { useRouter } from 'next/navigation';
import { DataTable, StatusBadge, FilterBar, ListError } from '@/shared/ui';
import type { ColumnDef } from '@/shared/ui';
import { useProducts } from '../hooks/use-products';
import type { ProductSummary } from '@repo/types';

const STATUS_OPTIONS = [
  { label: '판매중', value: 'ON_SALE' },
  { label: '품절', value: 'SOLD_OUT' },
  { label: '숨김', value: 'HIDDEN' },
];

const columns: ColumnDef<ProductSummary>[] = [
  { key: 'name', header: '상품명' },
  {
    key: 'price',
    header: '가격',
    render: (product: ProductSummary) => `${product.price.toLocaleString()}원`,
  },
  {
    key: 'status',
    header: '상태',
    render: (product: ProductSummary) => <StatusBadge status={product.status} />,
  },
  { key: 'categoryId', header: '카테고리' },
];

export function ProductList() {
  const router = useRouter();
  const { data, isLoading, isError, refetch, pagination, filters } = useProducts();

  if (isError) {
    return <ListError message="상품 목록을 불러오는데 실패했습니다." onRetry={() => refetch()} />;
  }

  return (
    <div>
      <FilterBar
        searchPlaceholder="상품명 검색..."
        searchValue={filters.name ?? ''}
        onSearchChange={(value) => filters.setFilter('name', value || undefined)}
        statusOptions={STATUS_OPTIONS}
        statusValue={filters.status}
        onStatusChange={(value) => filters.setFilter('status', value)}
      />
      <DataTable<ProductSummary & Record<string, unknown>>
        columns={columns as ColumnDef<ProductSummary & Record<string, unknown>>[]}
        data={(data?.content ?? []) as (ProductSummary & Record<string, unknown>)[]}
        pagination={pagination}
        isLoading={isLoading}
        emptyMessage="등록된 상품이 없습니다."
        onRowClick={(item) => router.push(`/products/${item.id}`)}
      />
    </div>
  );
}
