package com.example.order.infrastructure.event;

import com.example.order.application.service.PaymentConfirmationService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Component
@RequiredArgsConstructor
public class PaymentCompletedEventConsumer {

    private final PaymentConfirmationService paymentConfirmationService;
    private final EventDeduplicationChecker eventDeduplicationChecker;
    private final ObjectMapper objectMapper;

    @Transactional
    @KafkaListener(topics = "payment.payment.completed", groupId = "order-service")
    public void onMessage(@Payload String payload) throws JsonProcessingException {
        handle(objectMapper.readValue(payload, PaymentCompletedEvent.class));
    }

    void handle(PaymentCompletedEvent event) {
        if (eventDeduplicationChecker.isDuplicate(event.eventId(), "PaymentCompleted")) {
            return;
        }

        if (event.payload() == null) {
            log.warn("PaymentCompleted event has null payload, skipping. eventId={}", event.eventId());
            return;
        }

        String orderId = event.payload().orderId();
        if (orderId == null || orderId.isBlank()) {
            log.warn("PaymentCompleted event has no orderId, skipping. eventId={}", event.eventId());
            return;
        }

        String paymentId = event.payload().paymentId();
        if (paymentId == null || paymentId.isBlank()) {
            log.warn("PaymentCompleted event has no paymentId, skipping. eventId={}", event.eventId());
            return;
        }

        paymentConfirmationService.markPaymentCompleted(
                orderId, paymentId, EventFieldParser.parseInstant(event.payload().paidAt(), "paidAt"));
    }
}
