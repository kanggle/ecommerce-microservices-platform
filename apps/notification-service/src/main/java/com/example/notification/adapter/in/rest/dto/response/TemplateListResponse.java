package com.example.notification.adapter.in.rest.dto.response;

import com.example.notification.domain.model.NotificationTemplate;
import org.springframework.data.domain.Page;

import java.util.List;

public record TemplateListResponse(
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
            String createdAt
    ) {
        public static TemplateSummary from(NotificationTemplate t) {
            return new TemplateSummary(
                    t.getTemplateId(),
                    t.getType().name(),
                    t.getChannel().name(),
                    t.getSubject(),
                    t.getCreatedAt().toString()
            );
        }
    }

    public static TemplateListResponse from(Page<NotificationTemplate> page) {
        return new TemplateListResponse(
                page.getContent().stream().map(TemplateSummary::from).toList(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements()
        );
    }
}
