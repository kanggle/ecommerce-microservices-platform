'use client';

import { ReviewList } from '@/features/review';

interface ProductReviewSectionProps {
  productId: string;
}

export function ProductReviewSection({ productId }: ProductReviewSectionProps) {
  return <ReviewList productId={productId} />;
}
