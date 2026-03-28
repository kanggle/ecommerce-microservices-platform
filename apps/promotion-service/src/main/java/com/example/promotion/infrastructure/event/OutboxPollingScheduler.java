package com.example.promotion.infrastructure.event;

import com.example.promotion.infrastructure.persistence.repository.OutboxPublisher;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class OutboxPollingScheduler {

    static final String TOPIC_COUPON_USED = "promotion.coupon.used";
    static final String TOPIC_COUPON_EXPIRED = "promotion.coupon.expired";

    private final OutboxPublisher outboxPublisher;
    private final KafkaTemplate<String, String> kafkaTemplate;

    @Scheduled(fixedDelayString = "${outbox.polling.interval-ms:1000}")
    public void pollAndPublish() {
        outboxPublisher.publishPendingEvents(this::sendToKafka);
    }

    private boolean sendToKafka(String eventType, String aggregateId, String payload) {
        try {
            String topic = resolveTopic(eventType);
            kafkaTemplate.send(topic, aggregateId, payload).get();
            return true;
        } catch (Exception e) {
            log.error("Kafka send failed: eventType={}, aggregateId={}", eventType, aggregateId, e);
            return false;
        }
    }

    private String resolveTopic(String eventType) {
        return switch (eventType) {
            case "CouponUsed" -> TOPIC_COUPON_USED;
            case "CouponExpired" -> TOPIC_COUPON_EXPIRED;
            default -> throw new IllegalArgumentException("Unknown event type: " + eventType);
        };
    }
}
