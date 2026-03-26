package com.example.payment.domain.model;

import com.example.payment.domain.exception.InvalidPaymentException;

import java.time.LocalDateTime;
import java.util.UUID;

public class Payment {

    private String paymentId;
    private String orderId;
    private String userId;
    private long amount;
    private PaymentStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime paidAt;
    private LocalDateTime refundedAt;

    private Payment() {
    }

    public static Payment create(String orderId, String userId, long amount) {
        Payment payment = new Payment();
        payment.paymentId = UUID.randomUUID().toString();
        payment.orderId = orderId;
        payment.userId = userId;
        payment.amount = amount;
        payment.status = PaymentStatus.PENDING;
        payment.createdAt = LocalDateTime.now();
        return payment;
    }

    public static Payment reconstitute(String paymentId, String orderId, String userId,
                                        long amount, PaymentStatus status,
                                        LocalDateTime createdAt, LocalDateTime paidAt,
                                        LocalDateTime refundedAt) {
        Payment payment = new Payment();
        payment.paymentId = paymentId;
        payment.orderId = orderId;
        payment.userId = userId;
        payment.amount = amount;
        payment.status = status;
        payment.createdAt = createdAt;
        payment.paidAt = paidAt;
        payment.refundedAt = refundedAt;
        return payment;
    }

    public void complete() {
        if (this.status == PaymentStatus.COMPLETED) {
            return; // 멱등: 이미 완료된 결제
        }
        if (this.status != PaymentStatus.PENDING) {
            throw new InvalidPaymentException("PENDING 상태에서만 결제를 완료할 수 있습니다: " + status);
        }
        this.status = PaymentStatus.COMPLETED;
        this.paidAt = LocalDateTime.now();
    }

    public void refund() {
        if (this.status == PaymentStatus.REFUNDED) {
            return; // 멱등: 이미 환불된 결제
        }
        if (this.status != PaymentStatus.COMPLETED) {
            throw new InvalidPaymentException("Refund is only allowed in COMPLETED status: " + status);
        }
        this.status = PaymentStatus.REFUNDED;
        this.refundedAt = LocalDateTime.now();
    }

    public String getPaymentId() {
        return paymentId;
    }

    public String getOrderId() {
        return orderId;
    }

    public String getUserId() {
        return userId;
    }

    public long getAmount() {
        return amount;
    }

    public PaymentStatus getStatus() {
        return status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getPaidAt() {
        return paidAt;
    }

    public LocalDateTime getRefundedAt() {
        return refundedAt;
    }
}
