package com.example.notification.adapter.out.persistence.entity;

import com.example.notification.domain.model.NotificationChannel;
import com.example.notification.domain.model.NotificationStatus;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class NotificationJpaEntity {

    @Id
    @Column(name = "notification_id")
    private String notificationId;

    @Column(name = "user_id", nullable = false)
    private String userId;

    @Enumerated(EnumType.STRING)
    @Column(name = "channel", nullable = false)
    private NotificationChannel channel;

    @Column(name = "subject", nullable = false)
    private String subject;

    @Column(name = "body", nullable = false, columnDefinition = "TEXT")
    private String body;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private NotificationStatus status;

    @Column(name = "event_id")
    private String eventId;

    @Column(name = "retry_count", nullable = false)
    private int retryCount;

    @Column(name = "sent_at")
    private LocalDateTime sentAt;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    public static NotificationJpaEntity fromDomain(com.example.notification.domain.model.Notification notification) {
        NotificationJpaEntity entity = new NotificationJpaEntity();
        entity.notificationId = notification.getNotificationId();
        entity.userId = notification.getUserId();
        entity.channel = notification.getChannel();
        entity.subject = notification.getSubject();
        entity.body = notification.getBody();
        entity.status = notification.getStatus();
        entity.eventId = notification.getEventId();
        entity.retryCount = notification.getRetryCount();
        entity.sentAt = notification.getSentAt();
        entity.createdAt = notification.getCreatedAt();
        return entity;
    }
}
