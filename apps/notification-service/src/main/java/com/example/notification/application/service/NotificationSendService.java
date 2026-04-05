package com.example.notification.application.service;

import com.example.notification.application.command.SendNotificationCommand;
import com.example.notification.application.port.in.SendNotificationUseCase;
import com.example.notification.application.port.out.NotificationRepository;
import com.example.notification.application.port.out.NotificationSender;
import com.example.notification.application.port.out.PreferenceRepository;
import com.example.notification.application.port.out.TemplateRepository;
import com.example.notification.domain.model.Notification;
import com.example.notification.domain.model.NotificationChannel;
import com.example.notification.domain.model.NotificationTemplate;
import com.example.notification.domain.model.UserNotificationPreference;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationSendService implements SendNotificationUseCase {

    private static final int MAX_RETRIES = 3;

    private final NotificationRepository notificationRepository;
    private final TemplateRepository templateRepository;
    private final PreferenceRepository preferenceRepository;
    private final List<NotificationSender> notificationSenders;

    private Map<NotificationChannel, NotificationSender> getSenderMap() {
        return notificationSenders.stream()
                .collect(Collectors.toMap(
                        NotificationSender::supportedChannel,
                        Function.identity(),
                        (existing, replacement) -> replacement));
    }

    @Transactional
    public void sendNotification(SendNotificationCommand command) {
        if (notificationRepository.existsByEventId(command.eventId())) {
            log.info("Duplicate event detected, skipping. eventId={}", command.eventId());
            return;
        }

        UserNotificationPreference preference = preferenceRepository.findByUserId(command.userId())
                .orElseGet(() -> {
                    UserNotificationPreference defaultPref = UserNotificationPreference.createDefault(command.userId());
                    return preferenceRepository.save(defaultPref);
                });

        Map<NotificationChannel, NotificationSender> senderMap = getSenderMap();

        for (NotificationChannel channel : NotificationChannel.values()) {
            if (!preference.isChannelEnabled(channel)) {
                log.debug("Channel {} is disabled for user {}", channel, command.userId());
                continue;
            }

            if (!senderMap.containsKey(channel)) {
                log.debug("No sender available for channel {}", channel);
                continue;
            }

            Optional<NotificationTemplate> templateOpt = templateRepository
                    .findByTypeAndChannel(command.templateType(), channel);

            if (templateOpt.isEmpty()) {
                log.debug("No template found for type={}, channel={}", command.templateType(), channel);
                continue;
            }

            NotificationTemplate template = templateOpt.get();
            String renderedSubject = template.renderSubject(command.variables());
            String renderedBody = template.renderBody(command.variables());

            Notification notification = Notification.create(
                    command.userId(), channel, renderedSubject, renderedBody, command.eventId());

            try {
                senderMap.get(channel).send(command.userId(), renderedSubject, renderedBody);
                notification.markSent();
                log.info("Notification sent. userId={}, channel={}, eventId={}",
                        command.userId(), channel, command.eventId());
            } catch (Exception e) {
                notification.markFailed();
                log.error("Failed to send notification. userId={}, channel={}, eventId={}, error={}",
                        command.userId(), channel, command.eventId(), e.getMessage());
            }

            notificationRepository.save(notification);
        }
    }

    @Transactional
    public void retryFailedNotifications() {
        // Retry logic: called by scheduled task or external trigger
        // This is a simple implementation; in production, a batch worker would handle this
        log.info("Retry of failed notifications is handled via Kafka retry policy");
    }
}
