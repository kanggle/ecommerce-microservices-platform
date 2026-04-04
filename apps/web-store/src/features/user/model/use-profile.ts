import { useQuery } from '@tanstack/react-query';
import { getMyProfile } from '../api/user-profile-api';
import { userKeys } from './query-keys';

export function useProfile() {
  return useQuery({
    queryKey: userKeys.profile(),
    queryFn: getMyProfile,
  });
}
