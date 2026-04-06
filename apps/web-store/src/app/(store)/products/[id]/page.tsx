export const revalidate = 60;

import { cache } from 'react';
import { getProduct } from '@/entities/product';
import { ProductDetailWithCart } from '@/widgets/ProductDetailWithCart';
import { ProductReviewSection } from '@/widgets/ProductReviewSection';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

const getCachedProduct = cache((id: string) => getProduct(id));

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await getCachedProduct(id);

  if (!product) {
    return { title: '상품을 찾을 수 없습니다' };
  }

  return {
    title: `${product.name} | Web Store`,
    description: product.description,
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;
  const product = await getCachedProduct(id);

  if (!product) {
    notFound();
  }

  return (
    <div className="container" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
      <ProductDetailWithCart product={product} />
      <ProductReviewSection productId={product.id} />
    </div>
  );
}
