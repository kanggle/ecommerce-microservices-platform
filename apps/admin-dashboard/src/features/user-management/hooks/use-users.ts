import { useQuery } from '@tanstack/react-query';
import { getUsers } from '../api/user-api';
import { useListParams } from '../../../shared/hooks';
import type { UserStatus } from '@repo/types';

const VALID_STATUSES: UserStatus[] = ['ACTIVE', 'SUSPENDED', 'WITHDRAWN'];

function toUserStatus(value: string | null): UserStatus | undefined {
  if (!value) return undefined;
  return VALID_STATUSES.includes(value as UserStatus) ? (value as UserStatus) : undefined;
}

export function useUsers() {
  const { page, getParam, setFilter, buildPagination } = useListParams();

  const status = toUserStatus(getParam('status'));
  const email = getParam('email') || undefined;

  const query = useQuery({
    queryKey: ['admin', 'users', { page, status, email }],
    queryFn: () => getUsers({ page, status, email }),
  });

  return {
    ...query,
    pagination: buildPagination(query.data),
    filters: { status, email, setFilter },
  };
}
