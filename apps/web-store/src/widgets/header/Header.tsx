'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/features/auth';
import { useCart } from '@/features/cart';
import { useProfileImage } from '@/shared/context/ProfileImageContext';
import styles from './Header.module.css';

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const { items } = useCart();
  const { imageUrl: profileImageUrl } = useProfileImage();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
        </nav>

        <div className={styles.actions}>
          <Link href="/cart" className={styles.cartLink} aria-label="장바구니">
            <span className={styles.cartIcon} aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 01-8 0"/>
              </svg>
            </span>
            <span className={styles.cartBadge} style={{ visibility: cartCount > 0 ? 'visible' : 'hidden' }}>
              {cartCount > 99 ? '99+' : cartCount || 0}
            </span>
          </Link>
          {isAuthenticated ? (
            <div ref={dropdownRef} className={styles.profileWrapper}>
              <button
                type="button"
                className={styles.profileLink}
                aria-label="프로필 메뉴"
                onClick={() => setDropdownOpen((o) => !o)}
              >
                <span className={styles.profileAvatar}>
                  {profileImageUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={profileImageUrl} alt="프로필" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    user?.name?.charAt(0).toUpperCase() ?? 'U'
                  )}
                </span>
              </button>
              {dropdownOpen && (
                <div className={styles.dropdown}>
                  <Link href="/my/profile" className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                    내 프로필
                  </Link>
                  <Link href="/my/orders" className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                    주문내역
                  </Link>
                  <Link href="/my/addresses" className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                    배송지 관리
                  </Link>
                  <hr className={styles.dropdownDivider} />
                  <button
                    type="button"
                    className={styles.dropdownItem}
                    onClick={() => { setDropdownOpen(false); logout(); }}
                  >
                    로그아웃
                  </button>
                </div>
              )}
            </div>
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
