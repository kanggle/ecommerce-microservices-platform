'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  label: string;
  href: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: '대시보드', href: '/dashboard' },
  { label: '상품 관리', href: '/products' },
  { label: '주문 관리', href: '/orders' },
  { label: '사용자 관리', href: '/users' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      style={{
        width: '240px',
        minHeight: '100vh',
        backgroundColor: '#1f2937',
        color: '#fff',
        padding: '24px 0',
      }}
    >
      <div
        style={{
          padding: '0 20px',
          marginBottom: '32px',
          fontSize: '1.25rem',
          fontWeight: 700,
        }}
      >
        Admin
      </div>
      <nav>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {NAV_ITEMS.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  style={{
                    display: 'block',
                    padding: '12px 20px',
                    color: isActive ? '#fff' : '#9ca3af',
                    backgroundColor: isActive ? '#374151' : 'transparent',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                  }}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
