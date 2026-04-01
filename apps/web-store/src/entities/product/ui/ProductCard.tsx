import Image from 'next/image';
import Link from 'next/link';
import type { ProductSummary } from '@repo/types';
import styles from './ProductCard.module.css';

interface ProductCardProps {
  product: ProductSummary;
}

export function ProductCard({ product }: ProductCardProps) {
  const isSoldOut = product.status === 'SOLD_OUT';

  return (
    <Link
      href={`/products/${product.id}`}
      className={`${styles.card} ${isSoldOut ? styles.cardSoldOut : ''}`}
      style={{ opacity: isSoldOut ? 0.6 : 1 }}
    >
      {product.thumbnailUrl ? (
        <div className={styles.imageWrap}>
          <Image
            src={product.thumbnailUrl}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            style={{ objectFit: 'cover' }}
          />
        </div>
      ) : (
        <div className={styles.placeholder}>
          이미지 없음
        </div>
      )}
      <div className={styles.body}>
        <h3 className={styles.name}>{product.name}</h3>
        <p className={styles.price}>
          {product.price.toLocaleString()}원
        </p>
        {isSoldOut && (
          <span className={styles.soldOutBadge}>
            품절
          </span>
        )}
      </div>
    </Link>
  );
}
