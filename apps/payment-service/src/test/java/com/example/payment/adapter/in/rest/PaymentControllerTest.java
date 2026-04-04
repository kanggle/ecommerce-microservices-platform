package com.example.payment.adapter.in.rest;

import com.example.payment.application.service.PaymentProcessingService;
import com.example.payment.application.service.PaymentQueryService;
import com.example.payment.application.exception.UnauthorizedPaymentAccessException;
import com.example.payment.domain.exception.InvalidPaymentException;
import com.example.payment.domain.exception.PaymentNotFoundException;
import com.example.payment.domain.model.Payment;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(PaymentController.class)
@Import(GlobalExceptionHandler.class)
@DisplayName("PaymentController 슬라이스 테스트")
class PaymentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private PaymentQueryService paymentQueryService;

    @MockitoBean
    private PaymentProcessingService paymentProcessingService;

    @Test
    @DisplayName("정상 조회 시 200과 결제 정보를 반환한다")
    void getPayment_validRequest_returns200() throws Exception {
        Payment payment = Payment.create("order-1", "user-1", 30000L);
        payment.complete();
        given(paymentQueryService.getPaymentByOrderId("order-1", "user-1")).willReturn(payment);

        mockMvc.perform(get("/api/payments/orders/order-1").header("X-User-Id", "user-1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.orderId").value("order-1"))
                .andExpect(jsonPath("$.status").value("COMPLETED"))
                .andExpect(jsonPath("$.amount").value(30000));
    }

    @Test
    @DisplayName("X-User-Id 헤더 누락 시 400 반환")
    void getPayment_missingUserId_returns400() throws Exception {
        mockMvc.perform(get("/api/payments/orders/order-1"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_PAYMENT_REQUEST"));
    }

    @Test
    @DisplayName("존재하지 않는 orderId 조회 시 404 반환")
    void getPayment_notFound_returns404() throws Exception {
        given(paymentQueryService.getPaymentByOrderId(any(), any()))
                .willThrow(new PaymentNotFoundException("order-x"));

        mockMvc.perform(get("/api/payments/orders/order-x").header("X-User-Id", "user-1"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("PAYMENT_NOT_FOUND"));
    }

    @Test
    @DisplayName("다른 사용자 조회 시 403 반환")
    void getPayment_differentUser_returns403() throws Exception {
        given(paymentQueryService.getPaymentByOrderId(any(), any()))
                .willThrow(new UnauthorizedPaymentAccessException());

        mockMvc.perform(get("/api/payments/orders/order-1").header("X-User-Id", "attacker"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("ACCESS_DENIED"));
    }
}
