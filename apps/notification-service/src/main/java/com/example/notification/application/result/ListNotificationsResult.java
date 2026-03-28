package com.example.notification.application.result;

import com.example.notification.domain.model.Notification;
import org.springframework.data.domain.Page;

import java.time.LocalDateTime;
import java.util.List;

public record ListNotificationsResult(
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
            LocalDateTime sentAt,
            LocalDateTime createdAt
    ) {
        public static NotificationSummary from(Notification notification) {
            return new NotificationSummary(
                    notification.getNotificationId(),
                    notification.getChannel().name(),
                    notification.getSubject(),
                    notification.getStatus().name(),
                    notification.getSentAt(),
                    notification.getCreatedAt()
            );
        }
    }

    public static ListNotificationsResult from(Page<Notification> page) {
        return new ListNotificationsResult(
                page.getContent().stream().map(NotificationSummary::from).toList(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements()
        );
    }
}
