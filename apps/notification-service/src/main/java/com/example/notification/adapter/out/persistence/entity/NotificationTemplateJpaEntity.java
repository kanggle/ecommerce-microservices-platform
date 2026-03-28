package com.example.notification.adapter.out.persistence.entity;

import com.example.notification.domain.model.NotificationChannel;
import com.example.notification.domain.model.TemplateType;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "notification_templates",
        uniqueConstraints = @UniqueConstraint(columnNames = {"type", "channel"}))
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class NotificationTemplateJpaEntity {

    @Id
    @Column(name = "template_id")
    private String templateId;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private TemplateType type;

    @Enumerated(EnumType.STRING)
    @Column(name = "channel", nullable = false)
    private NotificationChannel channel;

    @Column(name = "subject", nullable = false)
    private String subject;

    @Column(name = "body", nullable = false, columnDefinition = "TEXT")
    private String body;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public static NotificationTemplateJpaEntity fromDomain(
            com.example.notification.domain.model.NotificationTemplate template) {
        NotificationTemplateJpaEntity entity = new NotificationTemplateJpaEntity();
        entity.templateId = template.getTemplateId();
        entity.type = template.getType();
        entity.channel = template.getChannel();
        entity.subject = template.getSubject();
        entity.body = template.getBody();
        entity.createdAt = template.getCreatedAt();
        entity.updatedAt = template.getUpdatedAt();
        return entity;
    }
}
