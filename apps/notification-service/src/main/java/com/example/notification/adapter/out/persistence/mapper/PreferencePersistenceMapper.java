package com.example.notification.adapter.out.persistence.mapper;

import com.example.notification.adapter.out.persistence.entity.UserNotificationPreferenceJpaEntity;
import com.example.notification.domain.model.UserNotificationPreference;
import org.springframework.stereotype.Component;

@Component
public class PreferencePersistenceMapper {

    public UserNotificationPreference toDomain(UserNotificationPreferenceJpaEntity entity) {
        return UserNotificationPreference.reconstitute(
                entity.getUserId(),
                entity.isEmailEnabled(),
                entity.isSmsEnabled(),
                entity.isPushEnabled(),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }

    public UserNotificationPreferenceJpaEntity toEntity(UserNotificationPreference preference) {
        return UserNotificationPreferenceJpaEntity.fromDomain(preference);
    }
}
