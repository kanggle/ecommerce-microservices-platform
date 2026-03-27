'use client';

import { useState } from 'react';
import { PageLayout, StatusBadge, DescriptionList, Section } from '@/shared/ui';
import { ErrorMessage } from '@repo/ui';
import { useProduct } from '../hooks/use-product';
import { StockAdjustmentForm } from './StockAdjustmentForm';
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
        {product.variants.length === 0 ? (
          <p style={{ color: '#6b7280' }}>등록된 옵션이 없습니다.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ padding: '8px 16px', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>
                  옵션명
                </th>
                <th style={{ padding: '8px 16px', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>
                  추가 가격
                </th>
                <th style={{ padding: '8px 16px', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>
                  재고
                </th>
                <th style={{ padding: '8px 16px', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>
                  작업
                </th>
              </tr>
            </thead>
            <tbody>
              {product.variants.map((variant) => (
                <tr key={variant.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '8px 16px' }}>{variant.optionName}</td>
                  <td style={{ padding: '8px 16px' }}>
                    {variant.additionalPrice > 0
                      ? `+${variant.additionalPrice.toLocaleString()}원`
                      : '-'}
                  </td>
                  <td style={{ padding: '8px 16px' }}>{variant.stock}</td>
                  <td style={{ padding: '8px 16px' }}>
                    <button
                      onClick={() => setSelectedVariant(variant)}
                      style={{
                        padding: '4px 12px',
                        fontSize: '0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        backgroundColor: '#fff',
                        cursor: 'pointer',
                      }}
                    >
                      재고 조정
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
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
