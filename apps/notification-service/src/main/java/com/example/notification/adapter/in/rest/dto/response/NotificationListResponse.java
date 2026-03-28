package com.example.notification.adapter.in.rest.dto.response;

import com.example.notification.domain.model.Notification;
import org.springframework.data.domain.Page;

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

    public static NotificationListResponse from(Page<Notification> page) {
        return new NotificationListResponse(
                page.getContent().stream().map(NotificationSummary::from).toList(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements()
        );
    }
}
