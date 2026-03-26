package com.example.payment.domain.repository;

import com.example.payment.domain.model.Payment;

import java.util.Optional;

public interface PaymentRepository {
    Payment save(Payment payment);
    Optional<Payment> findById(String paymentId);
    Optional<Payment> findByOrderId(String orderId);
}
