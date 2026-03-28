package com.example.notification.adapter.in.rest.dto.response;

import com.example.notification.domain.model.Notification;

public record NotificationDetailResponse(
        String notificationId,
        String channel,
        String subject,
        String body,
        String status,
        String sentAt,
        String createdAt
) {
    public static NotificationDetailResponse from(Notification n) {
        return new NotificationDetailResponse(
                n.getNotificationId(),
                n.getChannel().name(),
                n.getSubject(),
                n.getBody(),
                n.getStatus().name(),
                n.getSentAt() != null ? n.getSentAt().toString() : null,
                n.getCreatedAt().toString()
        );
    }
}
