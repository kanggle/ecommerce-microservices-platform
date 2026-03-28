package com.example.notification.adapter.in.rest.dto.response;

import com.example.notification.application.page.PageResult;
import com.example.notification.domain.model.Notification;

import java.util.List;

public record NotificationListResponse(
        List<NotificationSummary> content,
        int page,
        int size,
        long totalElements
) {
    public record NotificationSummary(
            String notificationId,
            String channel,
            String subject,
            String status,
            String sentAt,
            String createdAt
    ) {
        public static NotificationSummary from(Notification n) {
            return new NotificationSummary(
                    n.getNotificationId(),
                    n.getChannel().name(),
                    n.getSubject(),
                    n.getStatus().name(),
                    n.getSentAt() != null ? n.getSentAt().toString() : null,
                    n.getCreatedAt().toString()
            );
        }
    }

    public static NotificationListResponse from(PageResult<Notification> pageResult) {
        return new NotificationListResponse(
                pageResult.content().stream().map(NotificationSummary::from).toList(),
                pageResult.page(),
                pageResult.size(),
                pageResult.totalElements()
        );
    }
}
