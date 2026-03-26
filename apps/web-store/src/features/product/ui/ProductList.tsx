import type { ProductSummary } from '@repo/types';
import { ProductCard } from '@/entities/product';
import { EmptyState } from '@repo/ui';

interface ProductListProps {
  products: ProductSummary[];
}

export function ProductList({ products }: ProductListProps) {
  if (products.length === 0) {
    return <EmptyState message="등록된 상품이 없습니다." />;
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '16px',
      }}
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
