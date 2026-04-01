import { getProduct } from '@/entities/product';
import { ProductDetail } from '@/features/product';
import { ProductDetailWithCart } from '@/widgets/ProductDetailWithCart';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);

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
  const product = await getProduct(id);

  if (!product) {
    notFound();
  }

  return (
    <div className="container" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
      <ProductDetail product={product} />
      <div style={{ marginTop: 'var(--space-8)' }}>
        <ProductDetailWithCart product={product} />
      </div>
    </div>
  );
}
