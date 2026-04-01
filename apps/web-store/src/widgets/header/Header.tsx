'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/features/auth';
import { useCart } from '@/features/cart';
import styles from './Header.module.css';

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const { items } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.logo}>
          WebStore
        </Link>

        <button
          type="button"
          className={styles.mobileMenuBtn}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? '메뉴 닫기' : '메뉴 열기'}
        >
          {mobileOpen ? '\u2715' : '\u2630'}
        </button>

        <nav className={`${styles.nav} ${mobileOpen ? styles.mobileOpen : ''}`}>
          <Link href="/products" className={styles.navLink} onClick={() => setMobileOpen(false)}>
            전체상품
          </Link>
          {isAuthenticated && (
            <>
              <Link href="/orders" className={styles.navLink} onClick={() => setMobileOpen(false)}>
                주문내역
              </Link>
              <Link href="/my/profile" className={styles.navLink} onClick={() => setMobileOpen(false)}>
                마이페이지
              </Link>
            </>
          )}
        </nav>

        <div className={styles.actions}>
          <Link href="/cart" className={styles.cartLink} aria-label="장바구니">
            <span className={styles.cartIcon} aria-hidden="true">{'\uD83D\uDED2'}</span>
            {cartCount > 0 && (
              <span className={styles.cartBadge}>{cartCount > 99 ? '99+' : cartCount}</span>
            )}
          </Link>
          {isAuthenticated ? (
            <>
              <span className={styles.userName}>{user?.name}</span>
              <button type="button" className={styles.logoutBtn} onClick={logout}>
                로그아웃
              </button>
            </>
          ) : (
            <Link href="/login" className={styles.authLink}>
              로그인
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
