package com.example.payment.contract;

import com.example.payment.application.service.PaymentQueryService;
import com.example.payment.domain.exception.PaymentNotFoundException;
import com.example.payment.domain.model.Payment;
import com.example.payment.infrastructure.exception.GlobalExceptionHandler;
import com.example.payment.presentation.PaymentController;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.Set;

import static com.example.payment.contract.ContractTestHelper.assertFieldsMatch;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * payment-service API 응답 스키마 컨트랙트 검증 테스트.
 * 검증 근거: specs/contracts/http/payment-api.md
 */
@WebMvcTest(PaymentController.class)
@Import(GlobalExceptionHandler.class)
@DisplayName("Payment API 컨트랙트 테스트 — specs/contracts/http/payment-api.md")
class PaymentApiContractTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private PaymentQueryService paymentQueryService;

    private static final String SPEC_REF = "specs/contracts/http/payment-api.md";

    // ─── GET /api/payments/orders/{orderId} — 200 ───────────────────────

    @Test
    @DisplayName("GET /api/payments/orders/{orderId} 응답은 스펙 정의 필드만 포함한다")
    void getPayment_response_containsSpecFields() throws Exception {
        Payment payment = Payment.create("order-1", "user-1", 30000L);
        payment.complete();
        given(paymentQueryService.getPaymentByOrderId("order-1", "user-1")).willReturn(payment);

        MvcResult result = mockMvc.perform(get("/api/payments/orders/order-1")
                        .header("X-User-Id", "user-1"))
                .andExpect(status().isOk())
                .andReturn();

        assertFieldsMatch(result.getResponse().getContentAsString(),
                Set.of("paymentId", "orderId", "userId", "amount", "status", "createdAt", "paidAt", "refundedAt"),
                SPEC_REF + " GET /api/payments/orders/{orderId} 200");
    }

    // ─── Error Response Format ──────────────────────────────────────────

    @Test
    @DisplayName("에러 응답은 {code, message, timestamp}만 포함한다")
    void errorResponse_containsOnlyCodeMessageTimestamp() throws Exception {
        given(paymentQueryService.getPaymentByOrderId(any(), any()))
                .willThrow(new PaymentNotFoundException("order-x"));

        MvcResult result = mockMvc.perform(get("/api/payments/orders/order-x")
                        .header("X-User-Id", "user-1"))
                .andExpect(status().isNotFound())
                .andReturn();

        assertFieldsMatch(result.getResponse().getContentAsString(),
                Set.of("code", "message", "timestamp"),
                "specs/platform/error-handling.md error format");
    }
}
