'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMyReviews } from '../model/use-my-reviews';
import { useUpdateReview } from '../model/use-update-review';
import { useDeleteReview } from '../model/use-delete-review';
import { ErrorMessage, EmptyState } from '@repo/ui';
import { Skeleton } from '@/shared/ui/Skeleton';
import { StarRating } from './StarRating';
import { ReviewForm } from './ReviewForm';
import type { MyReviewItem } from '@repo/types';

const PAGE_SIZE = 20;

export function MyReviews() {
  const [page, setPage] = useState(0);
  const [editingReview, setEditingReview] = useState<MyReviewItem | null>(null);

  const { data, isLoading, isError, refetch } = useMyReviews(page, PAGE_SIZE);
  const updateReview = useUpdateReview();
  const deleteReview = useDeleteReview();

  const reviews = data?.content ?? [];
  const totalElements = data?.totalElements ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalElements / PAGE_SIZE));

  async function handleUpdate(formData: { rating: number; title: string; content: string }) {
    if (!editingReview) return;
    await updateReview.mutateAsync({
      reviewId: editingReview.reviewId,
      data: {
        rating: formData.rating,
        title: formData.title,
        content: formData.content,
      },
    });
    setEditingReview(null);
  }

  function handleDelete(reviewId: string) {
    if (window.confirm('리뷰를 삭제하시겠습니까?')) {
      deleteReview.mutate(reviewId);
    }
  }

  function handlePageChange(newPage: number) {
    if (newPage >= 0 && newPage < totalPages) {
      setPage(newPage);
    }
  }

  return (
    <div>
      <h1 className="page-title">내 리뷰</h1>

      {isLoading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              style={{
                padding: 'var(--space-4)',
                border: '1px solid var(--color-border-light)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <Skeleton width="60%" height="14px" />
              <div style={{ marginTop: 'var(--space-2)' }}>
                <Skeleton width="40%" height="14px" />
              </div>
              <div style={{ marginTop: 'var(--space-2)' }}>
                <Skeleton width="80%" height="14px" />
              </div>
            </div>
          ))}
        </div>
      )}

      {isError && (
        <ErrorMessage
          message="리뷰를 불러오는데 실패했습니다."
          onRetry={() => refetch()}
        />
      )}

      {!isLoading && !isError && reviews.length === 0 && (
        <EmptyState message="작성한 리뷰가 없습니다." />
      )}

      {!isLoading && !isError && reviews.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {reviews.map((review) => (
            <div key={review.reviewId}>
              {editingReview?.reviewId === review.reviewId ? (
                <div
                  style={{
                    padding: 'var(--space-4)',
                    border: '1px solid var(--color-primary)',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <h3 style={{ fontSize: 'var(--font-size-md, 1rem)', fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--space-3)' }}>
                    리뷰 수정
                  </h3>
                  <ReviewForm
                    initialRating={review.rating}
                    initialTitle={review.title}
                    initialContent={review.content}
                    onSubmit={handleUpdate}
                    onCancel={() => setEditingReview(null)}
                    submitLabel="리뷰 수정"
                    isPending={updateReview.isPending}
                  />
                </div>
              ) : (
                <div
                  style={{
                    padding: 'var(--space-4)',
                    border: '1px solid var(--color-border-light)',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <Link
                        href={`/products/${review.productId}`}
                        style={{
                          fontSize: 'var(--font-size-sm)',
                          color: 'var(--color-primary)',
                          textDecoration: 'none',
                        }}
                      >
                        {review.productName}
                      </Link>
                      <div style={{ marginTop: 'var(--space-1)' }}>
                        <StarRating rating={review.rating} />
                      </div>
                      <h4
                        style={{
                          fontSize: 'var(--font-size-md, 1rem)',
                          fontWeight: 'var(--font-weight-medium)',
                          marginTop: 'var(--space-1)',
                        }}
                      >
                        {review.title}
                      </h4>
                    </div>
                    <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                      <button
                        type="button"
                        className="btn"
                        onClick={() => setEditingReview(review)}
                        style={{ fontSize: 'var(--font-size-sm)' }}
                      >
                        수정
                      </button>
                      <button
                        type="button"
                        className="btn"
                        onClick={() => handleDelete(review.reviewId)}
                        style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-danger, #ef4444)' }}
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                  <p
                    style={{
                      marginTop: 'var(--space-2)',
                      fontSize: 'var(--font-size-sm)',
                      color: 'var(--color-text-primary)',
                      lineHeight: 1.6,
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                    }}
                  >
                    {review.content}
                  </p>
                  <p
                    style={{
                      marginTop: 'var(--space-2)',
                      fontSize: 'var(--font-size-xs, 0.75rem)',
                      color: 'var(--color-text-secondary)',
                    }}
                  >
                    {new Date(review.createdAt).toLocaleDateString('ko-KR')}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {!isLoading && !isError && totalElements > PAGE_SIZE && (
        <nav
          aria-label="페이지네이션"
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 'var(--space-2)',
            marginTop: 'var(--space-8)',
          }}
        >
          <button
            type="button"
            className="btn"
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 0}
            aria-label="이전 페이지"
          >
            이전
          </button>
          <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
            {page + 1} / {totalPages}
          </span>
          <button
            type="button"
            className="btn"
            onClick={() => handlePageChange(page + 1)}
            disabled={page >= totalPages - 1}
            aria-label="다음 페이지"
          >
            다음
          </button>
        </nav>
      )}
    </div>
  );
}
