'use client';

import { PageLayout, StatusBadge } from '@/shared/ui';
import { ErrorMessage } from '@repo/ui';
import { useUser } from '../hooks/use-user';

interface Props {
  userId: string;
}

export function UserDetail({ userId }: Props) {
  const { data: user, isLoading, isError, error, refetch } = useUser(userId);

  if (isError) {
    const is404 =
      error && typeof error === 'object' && 'code' in error && error.code === 'USER_PROFILE_NOT_FOUND';

    return (
      <ErrorMessage
        message={is404 ? '사용자를 찾을 수 없습니다.' : '사용자 정보를 불러오는데 실패했습니다.'}
        onRetry={is404 ? undefined : () => refetch()}
      />
    );
  }

  if (isLoading || !user) {
    return <PageLayout.Skeleton />;
  }

  return (
    <PageLayout title={user.name}>
      <section style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '12px' }}>
          기본 정보
        </h2>
        <dl style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px 16px' }}>
          <dt style={{ color: '#6b7280', fontWeight: 500 }}>상태</dt>
          <dd><StatusBadge status={user.status} /></dd>
          <dt style={{ color: '#6b7280', fontWeight: 500 }}>이메일</dt>
          <dd style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</dd>
          <dt style={{ color: '#6b7280', fontWeight: 500 }}>이름</dt>
          <dd>{user.name}</dd>
          <dt style={{ color: '#6b7280', fontWeight: 500 }}>닉네임</dt>
          <dd style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.nickname ?? '-'}</dd>
          <dt style={{ color: '#6b7280', fontWeight: 500 }}>연락처</dt>
          <dd>{user.phone ?? '-'}</dd>
          <dt style={{ color: '#6b7280', fontWeight: 500 }}>프로필 이미지</dt>
          <dd>
            {user.profileImageUrl ? (
              <img
                src={user.profileImageUrl}
                alt={`${user.name} 프로필`}
                style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover' }}
              />
            ) : (
              '-'
            )}
          </dd>
          <dt style={{ color: '#6b7280', fontWeight: 500 }}>가입일</dt>
          <dd>{new Date(user.createdAt).toLocaleString('ko-KR')}</dd>
          <dt style={{ color: '#6b7280', fontWeight: 500 }}>수정일</dt>
          <dd>{new Date(user.updatedAt).toLocaleString('ko-KR')}</dd>
        </dl>
      </section>
    </PageLayout>
  );
}
