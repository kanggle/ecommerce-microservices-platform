import { Skeleton, SkeletonList } from '@/shared/ui/Skeleton';

export default function CartLoading() {
  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: 'var(--space-8) var(--space-6) var(--space-16)' }}>
      <Skeleton width="100px" height="24px" />
      <div style={{ marginTop: 'var(--space-6)' }}>
        <SkeletonList count={3} />
      </div>
      <div style={{ marginTop: 'var(--space-6)' }}>
        <Skeleton width="100%" height="48px" />
      </div>
    </div>
  );
}
