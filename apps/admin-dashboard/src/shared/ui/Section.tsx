import type { ReactNode } from 'react';

interface SectionProps {
  title: string;
  children: ReactNode;
}

export function Section({ title, children }: SectionProps) {
  return (
    <section style={{ marginBottom: '24px' }}>
      <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '12px' }}>
        {title}
      </h2>
      {children}
    </section>
  );
}
