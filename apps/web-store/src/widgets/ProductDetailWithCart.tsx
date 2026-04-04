'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { ProductDetail } from '@repo/types';
import { ProductImage } from '@/entities/product';
import { useCart } from '@/features/cart';
import { Toast } from '@/shared/ui';
import styles from '@/features/product/ui/ProductDetail.module.css';

interface SelectedItem {
  variantId: string;
  quantity: number;
}

interface ProductDetailWithCartProps {
  product: ProductDetail;
}

export function ProductDetailWithCart({ product }: ProductDetailWithCartProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [showToast, setShowToast] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const variantMap = useMemo(() => new Map(product.variants.map((v) => [v.id, v])), [product.variants]);
  const images = useMemo(() => product.images?.length
    ? product.images
    : [`/images/products/${product.id}.jpg`], [product.images, product.id]);

  function handleSelect(variantId: string) {
    if (!variantId) return;
    if (selectedItems.some((s) => s.variantId === variantId)) return;
    const variant = variantMap.get(variantId);
    if (!variant || variant.stock === 0) return;
    setSelectedItems((prev) => [...prev, { variantId, quantity: 1 }]);
    setDropdownOpen(false);
  }

  function handleRemove(variantId: string) {
    setSelectedItems((prev) => prev.filter((s) => s.variantId !== variantId));
  }

  function handleQuantity(variantId: string, next: number) {
    const variant = variantMap.get(variantId);
    if (!variant) return;
    const clamped = Math.max(1, Math.min(variant.stock, next));
    setSelectedItems((prev) =>
      prev.map((s) => (s.variantId === variantId ? { ...s, quantity: clamped } : s)),
    );
  }

  const totalQuantity = useMemo(() => selectedItems.reduce((sum, s) => sum + s.quantity, 0), [selectedItems]);
  const totalPrice = useMemo(() => selectedItems.reduce((sum, s) => {
    const v = variantMap.get(s.variantId);
    if (!v) return sum;
    return sum + (product.price + v.additionalPrice) * s.quantity;
  }, 0), [selectedItems, variantMap, product.price]);

  const handleAddToCart = useCallback(() => {
    for (const item of selectedItems) {
      const v = variantMap.get(item.variantId);
      if (!v) continue;
      addItem(
        {
          productId: product.id,
          variantId: item.variantId,
          productName: product.name,
          optionName: v.optionName,
          price: product.price + v.additionalPrice,
        },
        item.quantity,
      );
    }
    setShowToast(true);
    setSelectedItems([]);
  }, [selectedItems, variantMap, addItem, product]);

  const handleBuyNow = useCallback(() => {
    for (const item of selectedItems) {
      const v = variantMap.get(item.variantId);
      if (!v) continue;
      addItem(
        {
          productId: product.id,
          variantId: item.variantId,
          productName: product.name,
          optionName: v.optionName,
          price: product.price + v.additionalPrice,
        },
        item.quantity,
      );
    }
    const keys = selectedItems.map((i) => `${product.id}:${i.variantId}`).join(',');
    router.push(`/checkout?items=${encodeURIComponent(keys)}`);
  }, [selectedItems, variantMap, addItem, product, router]);

  const canAdd = selectedItems.length > 0;

  const clearToast = useCallback(() => setShowToast(false), []);

  return (
    <>
      {showToast && (
        <Toast message="장바구니에 추가되었습니다." type="success" onClose={clearToast} />
      )}
      <nav className={styles.breadcrumb}>
        <Link href="/">홈</Link>
        <span className={styles.breadcrumbSep}>&rsaquo;</span>
        <Link href="/products">상품</Link>
        <span className={styles.breadcrumbSep}>&rsaquo;</span>
        <span className={styles.breadcrumbCurrent}>{product.name}</span>
      </nav>

      <div className={styles.layout}>
        <ProductImage
          images={images}
          alt={product.name}
        />

        <div className={styles.info}>
          <h1 className={styles.name}>{product.name}</h1>
          <p className={styles.basePrice}>
            {product.price.toLocaleString()}
            <span className={styles.basePriceUnit}>원</span>
          </p>
          <p className={styles.description}>{product.description}</p>

          <div className={styles.divider} />

          {product.variants.length > 0 && (
            <div className={styles.optionSection}>
              <div>
                <span className={styles.optionLabel}>옵션</span>
                <div className={styles.dropdown} ref={dropdownRef}>
                  <button
                    type="button"
                    className={styles.dropdownTrigger}
                    onClick={() => setDropdownOpen((o) => !o)}
                  >
                    <span className={styles.dropdownPlaceholder}>옵션을 선택하세요</span>
                    <span className={`${styles.dropdownArrow} ${dropdownOpen ? styles.dropdownArrowOpen : ''}`}>▾</span>
                  </button>
                  {dropdownOpen && (
                    <div className={styles.dropdownMenu}>
                      {product.variants.map((v) => {
                        const isSelected = selectedItems.some((s) => s.variantId === v.id);
                        const isSoldOut = v.stock === 0;
                        const isDisabled = isSoldOut || isSelected;
                        return (
                          <button
                            key={v.id}
                            type="button"
                            className={`${styles.dropdownItem} ${isDisabled ? styles.dropdownItemDisabled : ''}`}
                            disabled={isDisabled}
                            onClick={() => handleSelect(v.id)}
                          >
                            <span className={styles.dropdownItemName}>{v.optionName}</span>
                            <span className={styles.dropdownItemMeta}>
                              {v.additionalPrice > 0 && (
                                <span className={styles.dropdownItemPrice}>
                                  +{v.additionalPrice.toLocaleString()}원
                                </span>
                              )}
                              {isSoldOut ? (
                                <span className={styles.dropdownItemSoldOut}>품절</span>
                              ) : (
                                <span className={styles.dropdownItemStock}>재고 {v.stock}</span>
                              )}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {selectedItems.length > 0 && (
                <div className={styles.selectedList}>
                  {selectedItems.map((item) => {
                    const v = variantMap.get(item.variantId);
                    if (!v) return null;
                    const unitPrice = product.price + v.additionalPrice;
                    return (
                      <div key={item.variantId} className={styles.selectedItem}>
                        <span className={styles.selectedItemName}>{v.optionName}</span>
                        <div className={styles.stepper}>
                          <button
                            type="button"
                            className={styles.stepperBtn}
                            onClick={() => handleQuantity(item.variantId, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            aria-label="수량 줄이기"
                          >
                            −
                          </button>
                          <span className={styles.stepperValue}>{item.quantity}</span>
                          <button
                            type="button"
                            className={styles.stepperBtn}
                            onClick={() => handleQuantity(item.variantId, item.quantity + 1)}
                            disabled={item.quantity >= v.stock}
                            aria-label="수량 늘리기"
                          >
                            +
                          </button>
                        </div>
                        <span className={styles.selectedItemPrice}>
                          {(unitPrice * item.quantity).toLocaleString()}원
                        </span>
                        <button
                          type="button"
                          className={styles.selectedItemRemove}
                          onClick={() => handleRemove(item.variantId)}
                          aria-label={`${v.optionName} 삭제`}
                        >
                          ✕
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          <div className={styles.purchaseSummary}>
            <div className={styles.priceRow}>
              <span className={styles.priceRowLabel}>
                총 금액{totalQuantity > 0 ? ` (${totalQuantity}개)` : ''}
              </span>
              <span>
                <span className={styles.totalPrice}>
                  {totalPrice.toLocaleString()}
                </span>
                <span className={styles.totalPriceUnit}>원</span>
              </span>
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!canAdd}
                className={styles.cartBtn}
                style={{ flex: 1 }}
              >
                {canAdd ? '장바구니 담기' : '옵션을 선택하세요'}
              </button>
              <button
                type="button"
                onClick={handleBuyNow}
                disabled={!canAdd}
                className={styles.buyNowBtn}
                style={{ flex: 1 }}
              >
                즉시 주문
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
