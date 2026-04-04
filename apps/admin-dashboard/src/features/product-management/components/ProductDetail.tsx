'use client';

import { useState } from 'react';
import { PageLayout, StatusBadge, DescriptionList, Section } from '@/shared/ui';
import { ErrorMessage } from '@repo/ui';
import { useProduct } from '../hooks/use-product';
import { StockAdjustmentForm } from './StockAdjustmentForm';
import { VariantManagement } from './VariantManagement';
import type { ProductVariant } from '@repo/types';

interface Props {
  productId: string;
}

export function ProductDetail({ productId }: Props) {
  const { data: product, isLoading, isError, refetch } = useProduct(productId);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);

  if (isLoading || !product) {
    return <PageLayout.Skeleton />;
  }

  if (isError) {
    return <ErrorMessage message="상품 정보를 불러오는데 실패했습니다." onRetry={() => refetch()} />;
  }

  return (
    <PageLayout
      title={product.name}
      actions={[
        { label: '← 상품 관리', href: '/products', variant: 'secondary' as const },
        { label: '수정', href: `/products/${productId}/edit` },
      ]}
    >
      <Section title="기본 정보">
        <DescriptionList
          items={[
            { label: '상태', value: <StatusBadge status={product.status} /> },
            { label: '가격', value: `${product.price.toLocaleString()}원` },
            { label: '카테고리', value: product.categoryId },
            { label: '설명', value: product.description },
          ]}
        />
      </Section>

      <Section title="옵션 / 재고">
        <VariantManagement
          productId={productId}
          variants={product.variants}
          onChanged={() => refetch()}
        />
        <div style={{ marginTop: '16px', borderTop: '1px solid #eee', paddingTop: '12px' }}>
          {product.variants.map((variant) => (
            <button
              key={variant.id}
              onClick={() => setSelectedVariant(variant)}
              style={{
                padding: '6px 14px',
                fontSize: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                backgroundColor: '#fff',
                cursor: 'pointer',
                marginRight: '8px',
                marginBottom: '4px',
              }}
            >
              {variant.optionName} 재고 조정
            </button>
          ))}
        </div>
      </Section>

      {selectedVariant && (
        <StockAdjustmentForm
          productId={productId}
          variant={selectedVariant}
          onClose={() => setSelectedVariant(null)}
        />
      )}
    </PageLayout>
  );
}
