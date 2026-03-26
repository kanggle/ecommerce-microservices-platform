'use client';

import Link from 'next/link';

interface Action {
  label: string;
  href?: string;
  variant?: 'primary' | 'danger';
  disabled?: boolean;
  onClick?: () => void;
}

interface PageLayoutProps {
  title: string;
  actions?: Action[];
  children: React.ReactNode;
}

const VARIANT_STYLES: Record<string, React.CSSProperties> = {
  primary: { backgroundColor: '#2563eb', color: '#fff', border: 'none' },
  danger: { backgroundColor: '#dc2626', color: '#fff', border: 'none' },
};

export function PageLayout({ title, actions, children }: PageLayoutProps) {
  return (
    <div style={{ padding: '24px' }}>
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
        }}
      >
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>{title}</h1>
        {actions && actions.length > 0 && (
          <div style={{ display: 'flex', gap: '8px' }}>
            {actions.map((action) =>
              action.href ? (
                <Link
                  key={action.label}
                  href={action.href}
                  aria-label={action.label}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    ...(VARIANT_STYLES[action.variant ?? 'primary'] ?? VARIANT_STYLES.primary),
                  }}
                >
                  {action.label}
                </Link>
              ) : (
                <button
                  key={action.label}
                  onClick={action.onClick}
                  disabled={action.disabled}
                  aria-label={action.label}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    cursor: action.disabled ? 'not-allowed' : 'pointer',
                    fontSize: '0.875rem',
                    opacity: action.disabled ? 0.5 : 1,
                    ...(VARIANT_STYLES[action.variant ?? 'primary'] ?? VARIANT_STYLES.primary),
                  }}
                >
                  {action.label}
                </button>
              ),
            )}
          </div>
        )}
      </header>
      <main>{children}</main>
    </div>
  );
}

PageLayout.Skeleton = function Skeleton() {
  return (
    <div style={{ padding: '24px' }}>
      <div
        style={{
          height: '32px',
          width: '200px',
          backgroundColor: '#e5e7eb',
          borderRadius: '4px',
          marginBottom: '24px',
        }}
      />
      <div
        style={{
          height: '200px',
          backgroundColor: '#f3f4f6',
          borderRadius: '8px',
        }}
      />
    </div>
  );
};
