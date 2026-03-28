package com.example.notification.application.port.out;

import com.example.notification.domain.model.NotificationChannel;
import com.example.notification.domain.model.NotificationTemplate;
import com.example.notification.domain.model.TemplateType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;

public interface TemplateRepository {
    NotificationTemplate save(NotificationTemplate template);
    Optional<NotificationTemplate> findById(String templateId);
    Optional<NotificationTemplate> findByTypeAndChannel(TemplateType type, NotificationChannel channel);
    boolean existsByTypeAndChannel(TemplateType type, NotificationChannel channel);
    Page<NotificationTemplate> findAll(Pageable pageable);
}
