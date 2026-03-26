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
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
      <ProductDetail product={product} />
      <div style={{ marginTop: '24px' }}>
        <ProductDetailWithCart product={product} />
      </div>
    </div>
  );
}
