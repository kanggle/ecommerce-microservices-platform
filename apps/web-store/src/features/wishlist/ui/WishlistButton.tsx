'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getErrorMessage, isApiError, ERROR_MESSAGES } from '@repo/types/guards';
import { useAuth } from '@/features/auth';
import { useWishlistCheck } from '../model/use-wishlist-check';
import { addToWishlist, removeFromWishlist } from '../api/wishlist-api';
import { wishlistKeys } from '../model/query-keys';

interface WishlistButtonProps {
  productId: string;
  /** Optional wishlistItemId for removal (from wishlist list page) */
  wishlistItemId?: string;
  size?: 'sm' | 'md';
}

function WishlistButtonInner({ productId, wishlistItemId: externalItemId, size = 'sm' }: WishlistButtonProps) {
  const queryClient = useQueryClient();
  const { data: checkData, isLoading: checkLoading } = useWishlistCheck(productId, true);

  const inWishlist = checkData?.inWishlist ?? false;

  const addMutation = useMutation({
    mutationFn: () => addToWishlist(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: wishlistKeys.check(productId) });
      queryClient.invalidateQueries({ queryKey: wishlistKeys.lists() });
    },
    onError: (error) => {
      if (isApiError(error)) {
        if (error.code === 'ALREADY_IN_WISHLIST') {
          queryClient.invalidateQueries({ queryKey: wishlistKeys.check(productId) });
          return;
        }
        if (error.code === 'WISHLIST_LIMIT_EXCEEDED') {
          window.alert(ERROR_MESSAGES.WISHLIST_LIMIT_EXCEEDED);
          return;
        }
      }
      window.alert(getErrorMessage(error, '위시리스트 추가에 실패했습니다.'));
    },
  });

  const removeMutation = useMutation({
    mutationFn: (itemId: string) => removeFromWishlist(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: wishlistKeys.check(productId) });
      queryClient.invalidateQueries({ queryKey: wishlistKeys.lists() });
    },
    onError: (error) => {
      window.alert(getErrorMessage(error, '위시리스트 삭제에 실패했습니다.'));
    },
  });

  const isPending = addMutation.isPending || removeMutation.isPending;

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (isPending || checkLoading) return;

      if (inWishlist) {
        const itemId = externalItemId ?? checkData?.wishlistItemId ?? addMutation.data?.wishlistItemId;
        if (itemId) {
          removeMutation.mutate(itemId);
        }
      } else {
        addMutation.mutate();
      }
    },
    [isPending, checkLoading, inWishlist, externalItemId, addMutation, removeMutation],
  );

  return (
    <HeartButton
      active={inWishlist}
      disabled={isPending || checkLoading}
      size={size}
      onClick={handleClick}
    />
  );
}

export function WishlistButton({ productId, wishlistItemId, size = 'sm' }: WishlistButtonProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const handleUnauthClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      router.push('/login');
    },
    [router],
  );

  if (authLoading) {
    return <HeartButton active={false} disabled size={size} onClick={() => {}} />;
  }

  if (!isAuthenticated) {
    return <HeartButton active={false} disabled={false} size={size} onClick={handleUnauthClick} />;
  }

  return <WishlistButtonInner productId={productId} wishlistItemId={wishlistItemId} size={size} />;
}

interface HeartButtonProps {
  active: boolean;
  disabled: boolean;
  size: 'sm' | 'md';
  onClick: (e: React.MouseEvent) => void;
}

function HeartButton({ active, disabled, size, onClick }: HeartButtonProps) {
  const dimension = size === 'sm' ? 32 : 40;
  const iconSize = size === 'sm' ? 16 : 20;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={active ? '위시리스트에서 제거' : '위시리스트에 추가'}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: `${dimension}px`,
        height: `${dimension}px`,
        borderRadius: 'var(--radius-full)',
        border: 'none',
        background: 'rgba(255, 255, 255, 0.85)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all var(--transition-fast)',
        opacity: disabled ? 0.6 : 1,
        padding: 0,
        flexShrink: 0,
      }}
    >
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 24 24"
        fill={active ? 'var(--color-error)' : 'none'}
        stroke={active ? 'var(--color-error)' : 'var(--color-text-secondary)'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
  );
}
