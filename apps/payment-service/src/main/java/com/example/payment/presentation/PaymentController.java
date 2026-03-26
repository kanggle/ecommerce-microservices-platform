package com.example.payment.presentation;

import com.example.payment.application.service.PaymentQueryService;
import com.example.payment.domain.exception.InvalidPaymentException;
import com.example.payment.domain.model.Payment;
import com.example.payment.presentation.dto.PaymentDetailResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/payments")
@Validated
public class PaymentController {

    private final PaymentQueryService paymentQueryService;

    @GetMapping("/orders/{orderId}")
    public ResponseEntity<PaymentDetailResponse> getPaymentByOrderId(
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @PathVariable String orderId
    ) {
        if (userId == null || userId.isBlank()) {
            throw new InvalidPaymentException("X-User-Id 헤더는 필수입니다");
        }
        Payment payment = paymentQueryService.getPaymentByOrderId(orderId, userId);
        return ResponseEntity.ok(PaymentDetailResponse.from(payment));
    }
}
