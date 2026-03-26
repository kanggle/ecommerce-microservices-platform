package com.example.payment.application.service;

import com.example.payment.application.event.PaymentCompletedEvent;
import com.example.payment.domain.model.Payment;
import com.example.payment.domain.repository.PaymentRepository;
import com.example.payment.infrastructure.metrics.PaymentMetrics;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.KafkaException;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
public class PaymentProcessingService {

    private final String topicPaymentCompleted;
    private final PaymentRepository paymentRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final PaymentMetrics paymentMetrics;

    public PaymentProcessingService(
            @Value("${app.kafka.topics.payment-completed}") String topicPaymentCompleted,
            PaymentRepository paymentRepository,
            KafkaTemplate<String, Object> kafkaTemplate,
            PaymentMetrics paymentMetrics
    ) {
        this.topicPaymentCompleted = topicPaymentCompleted;
        this.paymentRepository = paymentRepository;
        this.kafkaTemplate = kafkaTemplate;
        this.paymentMetrics = paymentMetrics;
    }

    @Transactional
    public void processPayment(String orderId, String userId, long amount) {
        if (paymentRepository.findByOrderId(orderId).isPresent()) {
            log.info("Payment already exists for orderId={}, skipping", orderId);
            return;
        }

        Payment payment = Payment.create(orderId, userId, amount);
        paymentMetrics.incrementPaymentCreated();
        payment.complete(); // 시뮬레이션: 항상 성공
        paymentRepository.save(payment);
        paymentMetrics.incrementPaymentCompleted();
        paymentMetrics.addPaymentAmount(amount);

        try {
            kafkaTemplate.send(topicPaymentCompleted, payment.getPaymentId(), PaymentCompletedEvent.from(payment));
        } catch (KafkaException e) {
            log.error("Event publishing failed: eventType={}, topic={}, orderId={}", "PaymentCompleted", topicPaymentCompleted, orderId, e);
            paymentMetrics.incrementEventPublishFailure("PaymentCompleted");
        }

        log.info("Payment completed: paymentId={}, orderId={}", payment.getPaymentId(), orderId);
    }
}
