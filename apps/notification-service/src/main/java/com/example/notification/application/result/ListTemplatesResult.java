package com.example.notification.application.result;

import com.example.notification.domain.model.NotificationTemplate;
import org.springframework.data.domain.Page;

import java.time.LocalDateTime;
import java.util.List;

public record ListTemplatesResult(
        List<TemplateSummary> content,
        int page,
        int size,
        long totalElements
) {
    public record TemplateSummary(
            String templateId,
            String type,
            String channel,
            String subject,
            LocalDateTime createdAt
    ) {
        public static TemplateSummary from(NotificationTemplate template) {
            return new TemplateSummary(
                    template.getTemplateId(),
                    template.getType().name(),
                    template.getChannel().name(),
                    template.getSubject(),
                    template.getCreatedAt()
            );
        }
    }

    public static ListTemplatesResult from(Page<NotificationTemplate> page) {
        return new ListTemplatesResult(
                page.getContent().stream().map(TemplateSummary::from).toList(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements()
        );
    }
}
