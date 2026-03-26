package com.example.payment.application.service;

import com.example.payment.application.event.PaymentCompletedEvent;
import com.example.payment.application.port.out.PaymentEventPublisher;
import com.example.payment.application.port.out.PaymentMetricRecorder;
import com.example.payment.domain.model.Payment;
import com.example.payment.domain.repository.PaymentRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
public class PaymentProcessingService {

    private final PaymentRepository paymentRepository;
    private final PaymentEventPublisher paymentEventPublisher;
    private final PaymentMetricRecorder paymentMetricRecorder;

    public PaymentProcessingService(
            PaymentRepository paymentRepository,
            PaymentEventPublisher paymentEventPublisher,
            PaymentMetricRecorder paymentMetricRecorder
    ) {
        this.paymentRepository = paymentRepository;
        this.paymentEventPublisher = paymentEventPublisher;
        this.paymentMetricRecorder = paymentMetricRecorder;
    }

    @Transactional
    public void processPayment(String orderId, String userId, long amount) {
        if (paymentRepository.findByOrderId(orderId).isPresent()) {
            log.info("Payment already exists for orderId={}, skipping", orderId);
            return;
        }

        Payment payment = Payment.create(orderId, userId, amount);
        paymentMetricRecorder.incrementPaymentCreated();
        payment.complete(); // 시뮬레이션: 항상 성공
        paymentRepository.save(payment);
        paymentMetricRecorder.incrementPaymentCompleted();
        paymentMetricRecorder.addPaymentAmount(amount);

        paymentEventPublisher.publishPaymentCompleted(PaymentCompletedEvent.from(payment));

        log.info("Payment completed: paymentId={}, orderId={}", payment.getPaymentId(), orderId);
    }
}
