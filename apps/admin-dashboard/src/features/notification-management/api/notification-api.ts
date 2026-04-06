import { apiClient } from '@/shared/config/api';
import { createAdminNotificationApi } from '@repo/api-client';
import type {
  PaginatedResponse,
  NotificationTemplateSummary,
  NotificationTemplateDetail,
  CreateNotificationTemplateRequest,
  UpdateNotificationTemplateRequest,
  NotificationTemplateResponse,
  NotificationTemplateListParams,
} from '@repo/types';

const notificationApi = createAdminNotificationApi(apiClient);

export async function getTemplate(
  templateId: string,
): Promise<NotificationTemplateDetail> {
  return notificationApi.getTemplate(templateId);
}

export async function getTemplates(
  params?: NotificationTemplateListParams,
): Promise<PaginatedResponse<NotificationTemplateSummary>> {
  return notificationApi.getTemplates(params);
}

export async function createTemplate(
  data: CreateNotificationTemplateRequest,
): Promise<NotificationTemplateResponse> {
  return notificationApi.createTemplate(data);
}

export async function updateTemplate(
  templateId: string,
  data: UpdateNotificationTemplateRequest,
): Promise<NotificationTemplateResponse> {
  return notificationApi.updateTemplate(templateId, data);
}
