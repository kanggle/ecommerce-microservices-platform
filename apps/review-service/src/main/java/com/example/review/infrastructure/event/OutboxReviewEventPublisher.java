package com.example.review.infrastructure.event;

import com.example.messaging.outbox.OutboxWriter;
import com.example.review.domain.event.ReviewEvent;
import com.example.review.domain.event.ReviewEventPublisher;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class OutboxReviewEventPublisher implements ReviewEventPublisher {

    private final OutboxWriter outboxWriter;
    private final ObjectMapper objectMapper;

    @Override
    public void publish(ReviewEvent event) {
        String payload = serialize(event);
        String aggregateId = extractAggregateId(event);
        outboxWriter.save("Review", aggregateId, event.eventType(), payload);
        log.debug("Saved review event to outbox: eventType={}, aggregateId={}", event.eventType(), aggregateId);
    }

    private String extractAggregateId(ReviewEvent event) {
        return event.payload().reviewId();
    }

    private String serialize(ReviewEvent event) {
        try {
            return objectMapper.writeValueAsString(event);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Failed to serialize ReviewEvent", e);
        }
    }
}
