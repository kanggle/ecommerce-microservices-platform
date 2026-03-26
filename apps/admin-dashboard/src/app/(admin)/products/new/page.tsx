'use client';

import { PageLayout } from '@/shared/ui';
import { ProductForm } from '@/features/product-management';

export default function NewProductPage() {
  return (
    <PageLayout title="상품 등록">
      <ProductForm />
    </PageLayout>
  );
}
