'use client';

import { useState } from 'react';
import type { ProductDetail } from '@repo/types';
import { AddToCartButton } from '@/features/cart';

interface ProductDetailWithCartProps {
  product: ProductDetail;
}

export function ProductDetailWithCart({ product }: ProductDetailWithCartProps) {
  const availableVariants = product.variants.filter((v) => v.stock > 0);
  const [selectedVariantId, setSelectedVariantId] = useState(
    availableVariants[0]?.id ?? '',
  );
  const selectedVariant = product.variants.find((v) => v.id === selectedVariantId);
  const totalPrice = product.price + (selectedVariant?.additionalPrice ?? 0);

  return (
    <div
      className="card"
      style={{ padding: 'var(--space-6)' }}
    >
      {product.variants.length > 0 && (
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <label
            htmlFor="variant-select"
            className="label"
          >
            옵션 선택
          </label>
          <select
            id="variant-select"
            value={selectedVariantId}
            onChange={(e) => setSelectedVariantId(e.target.value)}
            className="input"
          >
            {product.variants.map((v) => (
              <option key={v.id} value={v.id} disabled={v.stock === 0}>
                {v.optionName}
                {v.additionalPrice > 0 ? ` (+${v.additionalPrice.toLocaleString()}원)` : ''}
                {v.stock === 0 ? ' (품절)' : ''}
              </option>
            ))}
          </select>
        </div>
      )}

      <p className="price" style={{ fontSize: 'var(--font-size-xl)', margin: '0 0 var(--space-4)' }}>
        {totalPrice.toLocaleString()}원
      </p>

      <AddToCartButton
        productId={product.id}
        variantId={selectedVariantId}
        productName={product.name}
        optionName={selectedVariant?.optionName ?? '기본'}
        price={totalPrice}
        disabled={!selectedVariant || selectedVariant.stock === 0}
      />
    </div>
  );
}
