import { Fragment } from 'react';

interface DescriptionItem {
  label: string;
  value: React.ReactNode;
}

interface DescriptionListProps {
  items: DescriptionItem[];
}

export function DescriptionList({ items }: DescriptionListProps) {
  return (
    <dl style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px 16px' }}>
      {items.map((item) => (
        <Fragment key={item.label}>
          <dt style={{ color: '#6b7280', fontWeight: 500 }}>{item.label}</dt>
          <dd>{item.value}</dd>
        </Fragment>
      ))}
    </dl>
  );
}
