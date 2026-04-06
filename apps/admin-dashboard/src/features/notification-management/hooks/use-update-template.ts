import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateTemplate } from '../api/notification-api';
import { templateKeys } from './query-keys';
import { alertError } from '@/shared/lib/alert-error';
import type { UpdateNotificationTemplateRequest } from '@repo/types';

export function useUpdateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      templateId,
      data,
    }: {
      templateId: string;
      data: UpdateNotificationTemplateRequest;
    }) => updateTemplate(templateId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: templateKeys.all });
    },
    onError: (error: unknown) => {
      alertError(error, '알림 템플릿 수정에 실패했습니다.');
    },
  });
}
