import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createTemplate } from '../api/notification-api';
import { templateKeys } from './query-keys';
import { alertError } from '@/shared/lib/alert-error';
import { isApiError } from '@repo/types/guards';

export function useCreateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: templateKeys.all });
    },
    onError: (error: unknown) => {
      if (isApiError(error) && error.code === 'TEMPLATE_ALREADY_EXISTS') {
        alertError(
          { ...error, message: '동일한 유형/채널 조합의 템플릿이 이미 존재합니다' },
          '동일한 유형/채널 조합의 템플릿이 이미 존재합니다',
        );
        return;
      }
      alertError(error, '알림 템플릿 생성에 실패했습니다.');
    },
  });
}
