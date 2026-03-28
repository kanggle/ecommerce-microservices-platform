package com.example.notification.application.command;

import com.example.notification.domain.model.NotificationChannel;
import com.example.notification.domain.model.TemplateType;

public record CreateTemplateCommand(
        TemplateType type,
        NotificationChannel channel,
        String subject,
        String body
) {
    public static CreateTemplateCommand of(String type, String channel, String subject, String body) {
        return new CreateTemplateCommand(
                TemplateType.valueOf(type),
                NotificationChannel.valueOf(channel),
                subject,
                body
        );
    }
}
