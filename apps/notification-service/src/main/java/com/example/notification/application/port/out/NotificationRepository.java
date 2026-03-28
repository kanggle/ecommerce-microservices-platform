package com.example.notification.application.port.out;

import com.example.notification.domain.model.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;

public interface NotificationRepository {
    Notification save(Notification notification);
    Optional<Notification> findById(String notificationId);
    Page<Notification> findByUserId(String userId, Pageable pageable);
    boolean existsByEventId(String eventId);
}
