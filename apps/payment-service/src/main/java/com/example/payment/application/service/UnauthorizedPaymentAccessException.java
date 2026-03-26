package com.example.payment.application.service;

public class UnauthorizedPaymentAccessException extends RuntimeException {
    public UnauthorizedPaymentAccessException() {
        super("해당 결제에 대한 접근 권한이 없습니다");
    }
}
