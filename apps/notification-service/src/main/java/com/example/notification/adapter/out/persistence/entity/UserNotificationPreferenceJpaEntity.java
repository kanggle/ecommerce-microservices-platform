package com.example.notification.adapter.out.persistence.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_notification_preferences")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class UserNotificationPreferenceJpaEntity {

    @Id
    @Column(name = "user_id")
    private String userId;

    @Column(name = "email_enabled", nullable = false)
    private boolean emailEnabled;

    @Column(name = "sms_enabled", nullable = false)
    private boolean smsEnabled;

    @Column(name = "push_enabled", nullable = false)
    private boolean pushEnabled;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public static UserNotificationPreferenceJpaEntity fromDomain(
            com.example.notification.domain.model.UserNotificationPreference pref) {
        UserNotificationPreferenceJpaEntity entity = new UserNotificationPreferenceJpaEntity();
        entity.userId = pref.getUserId();
        entity.emailEnabled = pref.isEmailEnabled();
        entity.smsEnabled = pref.isSmsEnabled();
        entity.pushEnabled = pref.isPushEnabled();
        entity.createdAt = pref.getCreatedAt();
        entity.updatedAt = pref.getUpdatedAt();
        return entity;
    }
}
