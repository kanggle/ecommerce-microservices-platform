'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useCart } from '../model/cart-context';

interface AddToCartButtonProps {
  productId: string;
  variantId: string;
  productName: string;
  optionName: string;
  price: number;
  disabled?: boolean;
}

export function AddToCartButton({
  productId,
  variantId,
  productName,
  optionName,
  price,
  disabled = false,
}: AddToCartButtonProps) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleClick = useCallback(() => {
    addItem({ productId, variantId, productName, optionName, price });
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setAdded(true);
    timerRef.current = setTimeout(() => {
      setAdded(false);
      timerRef.current = null;
    }, 1500);
  }, [addItem, productId, variantId, productName, optionName, price]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const bgColor = disabled
    ? 'var(--color-text-muted)'
    : added
      ? 'var(--color-success)'
      : 'var(--color-accent)';

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      aria-label={disabled ? '품절' : '장바구니 담기'}
      className="btn btn-lg"
      style={{
        backgroundColor: bgColor,
        color: 'var(--color-white)',
        border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'background-color var(--transition-normal)',
      }}
    >
      {disabled ? '품절' : added ? '담았습니다' : '장바구니 담기'}
    </button>
  );
}
