import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createTemplate } from '../api/notification-api';
import { templateKeys } from './query-keys';
import { alertError } from '@/shared/lib/alert-error';

export function useCreateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: templateKeys.all });
    },
    onError: (error: unknown) => {
      alertError(error, '알림 템플릿 생성에 실패했습니다.');
    },
  });
}
