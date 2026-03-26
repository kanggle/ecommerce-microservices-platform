import Image from 'next/image';
import Link from 'next/link';
import type { ProductSummary } from '@repo/types';

interface ProductCardProps {
  product: ProductSummary;
}

export function ProductCard({ product }: ProductCardProps) {
  const isSoldOut = product.status === 'SOLD_OUT';

  return (
    <Link
      href={`/products/${product.id}`}
      style={{
        display: 'block',
        border: '1px solid #eee',
        borderRadius: '8px',
        overflow: 'hidden',
        textDecoration: 'none',
        color: 'inherit',
        opacity: isSoldOut ? 0.6 : 1,
      }}
    >
      {product.thumbnailUrl && (
        <div style={{ aspectRatio: '1', backgroundColor: '#f5f5f5', position: 'relative' }}>
          <Image
            src={product.thumbnailUrl}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            style={{ objectFit: 'cover' }}
          />
        </div>
      )}
      <div style={{ padding: '12px' }}>
        <h3 style={{ margin: '0 0 8px', fontSize: '14px' }}>{product.name}</h3>
        <p style={{ margin: 0, fontWeight: 'bold' }}>
          {product.price.toLocaleString()}원
        </p>
        {isSoldOut && (
          <span
            style={{
              display: 'inline-block',
              marginTop: '4px',
              padding: '2px 6px',
              fontSize: '12px',
              backgroundColor: '#eee',
              borderRadius: '4px',
            }}
          >
            품절
          </span>
        )}
      </div>
    </Link>
  );
}
