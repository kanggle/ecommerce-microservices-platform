package com.example.review.infrastructure.event;

import com.example.review.domain.event.ReviewEvent;
import com.example.review.domain.event.ReviewEventPublisher;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class KafkaReviewEventPublisher implements ReviewEventPublisher {

    static final String TOPIC_REVIEW_CREATED = "review.review.created";
    static final String TOPIC_REVIEW_UPDATED = "review.review.updated";
    static final String TOPIC_REVIEW_DELETED = "review.review.deleted";

    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Override
    public void publish(ReviewEvent event) {
        String topic = switch (event.eventType()) {
            case "ReviewCreated" -> TOPIC_REVIEW_CREATED;
            case "ReviewUpdated" -> TOPIC_REVIEW_UPDATED;
            case "ReviewDeleted" -> TOPIC_REVIEW_DELETED;
            default -> throw new IllegalArgumentException("Unknown event type: " + event.eventType());
        };

        String key = event.eventId().toString();
        try {
            kafkaTemplate.send(topic, key, event);
            log.debug("Published event to Kafka: topic={}, eventType={}, key={}", topic, event.eventType(), key);
        } catch (Exception e) {
            log.error("Event publishing failed: eventType={}, topic={}, key={}", event.eventType(), topic, key, e);
        }
    }
}
