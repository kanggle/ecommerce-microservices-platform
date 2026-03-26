package com.example.auth.infrastructure.persistence;

import com.example.auth.domain.entity.User;
import org.springframework.stereotype.Component;

@Component
class UserJpaMapper {

    User toDomain(UserJpaEntity entity) {
        return User.reconstitute(
                entity.getId(),
                entity.getEmail(),
                entity.getPasswordHash(),
                entity.getName(),
                entity.getCreatedAt(),
                entity.getUpdatedAt(),
                entity.isActive()
        );
    }

    UserJpaEntity toEntity(User user) {
        return UserJpaEntity.fromDomain(user);
    }
}
