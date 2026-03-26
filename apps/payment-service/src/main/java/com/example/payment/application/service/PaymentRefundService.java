package com.example.payment.application.service;

import com.example.payment.application.event.PaymentRefundedEvent;
import com.example.payment.domain.model.Payment;
import com.example.payment.domain.model.PaymentStatus;
import com.example.payment.domain.repository.PaymentRepository;
import com.example.payment.infrastructure.metrics.PaymentMetrics;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.KafkaException;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Slf4j
@Service
public class PaymentRefundService {

    private final String topicPaymentRefunded;
    private final PaymentRepository paymentRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final PaymentMetrics paymentMetrics;

    public PaymentRefundService(
            @Value("${app.kafka.topics.payment-refunded}") String topicPaymentRefunded,
            PaymentRepository paymentRepository,
            KafkaTemplate<String, Object> kafkaTemplate,
            PaymentMetrics paymentMetrics
    ) {
        this.topicPaymentRefunded = topicPaymentRefunded;
        this.paymentRepository = paymentRepository;
        this.kafkaTemplate = kafkaTemplate;
        this.paymentMetrics = paymentMetrics;
    }

    @Transactional
    public void refundPayment(String orderId) {
        Optional<Payment> paymentOpt = paymentRepository.findByOrderId(orderId);
        if (paymentOpt.isEmpty()) {
            log.info("No payment found for orderId={}, skipping refund", orderId);
            return;
        }

        Payment payment = paymentOpt.get();
        if (payment.getStatus() == PaymentStatus.REFUNDED) {
            log.warn("Duplicate refund attempt for orderId={}, paymentId={}", orderId, payment.getPaymentId());
            return;
        }

        payment.refund();
        paymentRepository.save(payment);
        paymentMetrics.incrementPaymentRefunded();

        try {
            kafkaTemplate.send(topicPaymentRefunded, payment.getPaymentId(), PaymentRefundedEvent.from(payment));
        } catch (KafkaException e) {
            log.error("Event publishing failed: eventType={}, topic={}, orderId={}", "PaymentRefunded", topicPaymentRefunded, orderId, e);
            paymentMetrics.incrementEventPublishFailure("PaymentRefunded");
        }

        log.info("Payment refunded: paymentId={}, orderId={}", payment.getPaymentId(), orderId);
    }
}
