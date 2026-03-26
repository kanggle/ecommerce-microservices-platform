package com.example.order.infrastructure.event;

import com.example.order.application.service.PaymentRefundConfirmationService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Slf4j
@Component
@RequiredArgsConstructor
public class PaymentRefundedEventConsumer {

    private final PaymentRefundConfirmationService paymentRefundConfirmationService;
    private final EventDeduplicationChecker eventDeduplicationChecker;
    private final ObjectMapper objectMapper;

    @Transactional
    @KafkaListener(topics = "payment.payment.refunded", groupId = "order-service")
    public void onMessage(@Payload String payload) throws JsonProcessingException {
        handle(objectMapper.readValue(payload, PaymentRefundedEvent.class));
    }

    void handle(PaymentRefundedEvent event) {
        if (eventDeduplicationChecker.isDuplicate(event.eventId(), "PaymentRefunded")) {
            return;
        }

        if (event.payload() == null) {
            log.warn("PaymentRefunded event has null payload, skipping. eventId={}", event.eventId());
            return;
        }

        String orderId = event.payload().orderId();
        if (orderId == null || orderId.isBlank()) {
            log.warn("PaymentRefunded event has no orderId, skipping. eventId={}", event.eventId());
            return;
        }

        Instant refundedAt = parseRefundedAt(event.payload().refundedAt());
        paymentRefundConfirmationService.markRefunded(orderId, refundedAt);
    }

    private Instant parseRefundedAt(String refundedAtStr) {
        if (refundedAtStr == null || refundedAtStr.isBlank()) {
            throw new IllegalArgumentException("refundedAt is required but was null or blank");
        }
        try {
            return Instant.parse(refundedAtStr);
        } catch (Exception e) {
            throw new IllegalArgumentException("Failed to parse refundedAt: " + refundedAtStr, e);
        }
    }
}
