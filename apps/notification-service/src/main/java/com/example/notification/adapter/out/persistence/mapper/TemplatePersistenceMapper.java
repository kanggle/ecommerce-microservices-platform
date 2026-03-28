package com.example.notification.adapter.out.persistence.mapper;

import com.example.notification.adapter.out.persistence.entity.NotificationTemplateJpaEntity;
import com.example.notification.domain.model.NotificationTemplate;
import org.springframework.stereotype.Component;

@Component
public class TemplatePersistenceMapper {

    public NotificationTemplate toDomain(NotificationTemplateJpaEntity entity) {
        return NotificationTemplate.reconstitute(
                entity.getTemplateId(),
                entity.getType(),
                entity.getChannel(),
                entity.getSubject(),
                entity.getBody(),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }

    public NotificationTemplateJpaEntity toEntity(NotificationTemplate template) {
        return NotificationTemplateJpaEntity.fromDomain(template);
    }
}
