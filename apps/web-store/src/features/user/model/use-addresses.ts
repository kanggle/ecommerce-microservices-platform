import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getMyAddresses } from '../api/address-api';
import { userKeys } from './query-keys';

export function useAddresses() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: userKeys.addresses(),
    queryFn: getMyAddresses,
  });

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: userKeys.addresses() });
  }

  return { ...query, invalidate };
}
