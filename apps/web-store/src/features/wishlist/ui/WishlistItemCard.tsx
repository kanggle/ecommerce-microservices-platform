'use client';

import { useCallback } from 'react';
import Link from 'next/link';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getErrorMessage } from '@repo/types/guards';
import type { WishlistItem } from '@repo/types';
import { removeFromWishlist } from '../api/wishlist-api';
import { wishlistKeys } from '../model/query-keys';

interface WishlistItemCardProps {
  item: WishlistItem;
}

export function WishlistItemCard({ item }: WishlistItemCardProps) {
  const queryClient = useQueryClient();
  const isDeleted = item.productStatus === 'DELETED' || item.productName === null;

  const removeMutation = useMutation({
    mutationFn: () => removeFromWishlist(item.wishlistItemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: wishlistKeys.all });
    },
    onError: (error) => {
      window.alert(getErrorMessage(error, '위시리스트 삭제에 실패했습니다.'));
    },
  });

  const handleRemove = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!removeMutation.isPending) {
        removeMutation.mutate();
      }
    },
    [removeMutation],
  );

  const formattedDate = new Date(item.addedAt).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const content = (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-4)',
        padding: 'var(--space-4)',
        border: '1px solid var(--color-border-light)',
        borderRadius: 'var(--radius-md)',
        background: 'var(--color-white)',
        opacity: isDeleted ? 0.6 : 1,
        transition: 'box-shadow var(--transition-fast)',
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <span
            style={{
              fontSize: 'var(--font-size-sm)',
              fontWeight: 'var(--font-weight-medium)',
              color: isDeleted ? 'var(--color-text-muted)' : 'var(--color-text)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {isDeleted ? '판매 종료' : item.productName}
          </span>
          {isDeleted && (
            <span
              style={{
                fontSize: 'var(--font-size-xs)',
                padding: '1px 6px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--color-bg-tertiary)',
                color: 'var(--color-text-muted)',
                fontWeight: 'var(--font-weight-semibold)',
                flexShrink: 0,
              }}
            >
              삭제됨
            </span>
          )}
        </div>
        <div
          style={{
            marginTop: 'var(--space-1)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3)',
          }}
        >
          {!isDeleted && (
            <span
              style={{
                fontSize: 'var(--font-size-sm)',
                fontWeight: 'var(--font-weight-bold)',
                color: 'var(--color-accent)',
              }}
            >
              {item.productPrice.toLocaleString()}원
            </span>
          )}
          <span
            style={{
              fontSize: 'var(--font-size-xs)',
              color: 'var(--color-text-muted)',
            }}
          >
            {formattedDate} 추가
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleRemove}
        disabled={removeMutation.isPending}
        aria-label="위시리스트에서 제거"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '32px',
          height: '32px',
          borderRadius: 'var(--radius-full)',
          border: 'none',
          background: 'transparent',
          cursor: removeMutation.isPending ? 'not-allowed' : 'pointer',
          transition: 'all var(--transition-fast)',
          opacity: removeMutation.isPending ? 0.5 : 1,
          padding: 0,
          flexShrink: 0,
        }}
      >
        <svg
          width={16}
          height={16}
          viewBox="0 0 24 24"
          fill="var(--color-error)"
          stroke="var(--color-error)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </button>
    </div>
  );

  if (isDeleted) {
    return content;
  }

  return (
    <Link
      href={`/products/${item.productId}`}
      style={{ textDecoration: 'none', color: 'inherit' }}
    >
      {content}
    </Link>
  );
}
