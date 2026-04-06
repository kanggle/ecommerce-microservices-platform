import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getErrorMessage } from '@repo/types/guards';
import { updateMyPreferences } from '../api/notification-api';
import { notificationKeys } from './query-keys';
import type { UpdateNotificationPreferencesRequest } from '@repo/types';

export function useUpdatePreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateNotificationPreferencesRequest) =>
      updateMyPreferences(data),
    onSuccess: (result) => {
      queryClient.setQueryData(notificationKeys.preferences(), result);
    },
    onError: (error) => {
      window.alert(getErrorMessage(error, '알림 설정 변경에 실패했습니다.'));
    },
  });
}
