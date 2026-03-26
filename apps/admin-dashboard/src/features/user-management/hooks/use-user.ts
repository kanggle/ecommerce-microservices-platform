import { useQuery } from '@tanstack/react-query';
import { getUser } from '../api/user-api';

export function useUser(userId: string) {
  return useQuery({
    queryKey: ['admin', 'users', userId],
    queryFn: () => getUser(userId),
    enabled: !!userId,
  });
}
