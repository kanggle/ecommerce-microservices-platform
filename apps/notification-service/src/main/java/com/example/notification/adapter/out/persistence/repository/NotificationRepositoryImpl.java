package com.example.notification.adapter.out.persistence.repository;

import com.example.notification.adapter.out.persistence.mapper.NotificationPersistenceMapper;
import com.example.notification.application.port.out.NotificationRepository;
import com.example.notification.domain.model.Notification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class NotificationRepositoryImpl implements NotificationRepository {

    private final NotificationJpaRepository jpaRepository;
    private final NotificationPersistenceMapper mapper;

    @Override
    public Notification save(Notification notification) {
        var entity = mapper.toEntity(notification);
        var saved = jpaRepository.save(entity);
        return mapper.toDomain(saved);
    }

    @Override
    public Optional<Notification> findById(String notificationId) {
        return jpaRepository.findById(notificationId).map(mapper::toDomain);
    }

    @Override
    public Page<Notification> findByUserId(String userId, Pageable pageable) {
        return jpaRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable).map(mapper::toDomain);
    }

    @Override
    public boolean existsByEventId(String eventId) {
        return jpaRepository.existsByEventId(eventId);
    }
}
