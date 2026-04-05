'use client';

import { useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { ProductDetail } from '@repo/types';
import { ProductImage } from '@/entities/product';
import { useCart } from '@/features/cart';
import { Toast } from '@/shared/ui';
import { VariantSelector } from './ProductDetailWithCart/VariantSelector';
import { SelectedItemsList } from './ProductDetailWithCart/SelectedItemsList';
import { PurchaseSummary } from './ProductDetailWithCart/PurchaseSummary';
import type { SelectedItem } from './ProductDetailWithCart/types';
import styles from './ProductDetailWithCart.module.css';

interface ProductDetailWithCartProps {
  product: ProductDetail;
}

export function ProductDetailWithCart({ product }: ProductDetailWithCartProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [showToast, setShowToast] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

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

  const handleDropdownClose = useCallback(() => setDropdownOpen(false), []);
  const handleDropdownToggle = useCallback(() => setDropdownOpen((o) => !o), []);

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
              <VariantSelector
                variants={product.variants}
                selectedItems={selectedItems}
                dropdownOpen={dropdownOpen}
                onDropdownToggle={handleDropdownToggle}
                onSelect={handleSelect}
                onDropdownClose={handleDropdownClose}
              />

              <SelectedItemsList
                selectedItems={selectedItems}
                variantMap={variantMap}
                basePrice={product.price}
                onQuantityChange={handleQuantity}
                onRemove={handleRemove}
              />
            </div>
          )}

          <PurchaseSummary
            totalPrice={totalPrice}
            totalQuantity={totalQuantity}
            canAdd={canAdd}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
          />
        </div>
      </div>
    </>
  );
}
