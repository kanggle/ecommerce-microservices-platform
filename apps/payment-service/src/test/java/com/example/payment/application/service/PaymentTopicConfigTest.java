package com.example.payment.application.service;

import com.example.payment.application.port.out.PaymentEventPublisher;
import com.example.payment.domain.model.Payment;
import com.example.payment.application.port.out.PaymentRepository;
import com.example.payment.infrastructure.metrics.PaymentMetrics;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
@DisplayName("이벤트 발행 위임 테스트")
class PaymentTopicConfigTest {

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private PaymentEventPublisher paymentEventPublisher;

    @Mock
    private PaymentMetrics paymentMetrics;

    @Test
    @DisplayName("PaymentProcessingService는 PaymentEventPublisher.publishPaymentCompleted를 호출한다")
    void processPayment_delegatesToEventPublisher() {
        PaymentProcessingService service = new PaymentProcessingService(
                paymentRepository, paymentEventPublisher, paymentMetrics
        );

        given(paymentRepository.findByOrderId("order-1")).willReturn(Optional.empty());
        given(paymentRepository.save(any())).willAnswer(inv -> inv.getArgument(0));

        service.processPayment("order-1", "user-1", 10000L);

        ArgumentCaptor<com.example.payment.application.event.PaymentCompletedEvent> captor =
                ArgumentCaptor.forClass(com.example.payment.application.event.PaymentCompletedEvent.class);
        verify(paymentEventPublisher).publishPaymentCompleted(captor.capture());
        assertThat(captor.getValue().payload().orderId()).isEqualTo("order-1");
    }

    @Test
    @DisplayName("PaymentRefundService는 PaymentEventPublisher.publishPaymentRefunded를 호출한다")
    void refundPayment_delegatesToEventPublisher() {
        PaymentRefundService service = new PaymentRefundService(
                paymentRepository, paymentEventPublisher, paymentMetrics
        );

        Payment payment = Payment.create("order-1", "user-1", 10000L);
        payment.complete();
        given(paymentRepository.findByOrderId("order-1")).willReturn(Optional.of(payment));
        given(paymentRepository.save(any())).willAnswer(inv -> inv.getArgument(0));

        service.refundPayment("order-1");

        ArgumentCaptor<com.example.payment.application.event.PaymentRefundedEvent> captor =
                ArgumentCaptor.forClass(com.example.payment.application.event.PaymentRefundedEvent.class);
        verify(paymentEventPublisher).publishPaymentRefunded(captor.capture());
        assertThat(captor.getValue().payload().orderId()).isEqualTo("order-1");
    }
}
