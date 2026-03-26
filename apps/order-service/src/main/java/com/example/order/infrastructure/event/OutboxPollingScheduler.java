package com.example.order.infrastructure.event;

import com.example.order.application.port.OrderMetricsPort;
import com.example.order.infrastructure.persistence.OutboxPublisher;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class OutboxPollingScheduler {

    static final String TOPIC_ORDER_PLACED = "order.order.placed";
    static final String TOPIC_ORDER_CANCELLED = "order.order.cancelled";

    private final OutboxPublisher outboxPublisher;
    private final KafkaTemplate<String, String> kafkaTemplate;
    private final OrderMetricsPort orderMetrics;

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
            log.error("Kafka 전송 실패: eventType={}, aggregateId={}", eventType, aggregateId, e);
            orderMetrics.recordEventPublishFailure(eventType);
            return false;
        }
    }

    private String resolveTopic(String eventType) {
        return switch (eventType) {
            case "OrderPlaced" -> TOPIC_ORDER_PLACED;
            case "OrderCancelled" -> TOPIC_ORDER_CANCELLED;
            default -> throw new IllegalArgumentException("Unknown event type: " + eventType);
        };
    }
}
