'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useProfileImage } from '@/shared/context/ProfileImageContext';
import styles from './Header.module.css';

interface ProfileDropdownProps {
  userName: string | undefined;
  onLogout: () => void;
}

export function ProfileDropdown({ userName, onLogout }: ProfileDropdownProps) {
  const { imageUrl: profileImageUrl } = useProfileImage();
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

  return (
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
            userName?.charAt(0).toUpperCase() ?? 'U'
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
            onClick={() => { setDropdownOpen(false); onLogout(); }}
          >
            로그아웃
          </button>
        </div>
      )}
    </div>
  );
}
