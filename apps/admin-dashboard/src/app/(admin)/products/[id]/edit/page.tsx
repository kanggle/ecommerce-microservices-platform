'use client';

import { use } from 'react';
import { PageLayout } from '@/shared/ui';
import { ErrorMessage } from '@repo/ui';
import { ProductForm, useProduct } from '@/features/product-management';

interface Props {
  params: Promise<{ id: string }>;
}

export default function EditProductPage({ params }: Props) {
  const { id } = use(params);
  const { data: product, isLoading, isError, refetch } = useProduct(id);

  if (isLoading || !product) {
    return <PageLayout.Skeleton />;
  }

  if (isError) {
    return <ErrorMessage message="상품 정보를 불러오는데 실패했습니다." onRetry={() => refetch()} />;
  }

  return (
    <PageLayout title={`${product.name} 수정`}>
      <ProductForm product={product} />
    </PageLayout>
  );
}
