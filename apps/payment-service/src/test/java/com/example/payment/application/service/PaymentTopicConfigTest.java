package com.example.payment.application.service;

import com.example.payment.domain.model.Payment;
import com.example.payment.domain.repository.PaymentRepository;
import com.example.payment.infrastructure.metrics.PaymentMetrics;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.kafka.core.KafkaTemplate;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
@DisplayName("토픽명 설정 주입 테스트")
class PaymentTopicConfigTest {

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private KafkaTemplate<String, Object> kafkaTemplate;

    @Mock
    private PaymentMetrics paymentMetrics;

    @Test
    @DisplayName("PaymentProcessingService에 주입된 토픽명으로 이벤트가 발행된다")
    void processPayment_usesInjectedTopic() {
        String customTopic = "custom.payment.completed";
        PaymentProcessingService service = new PaymentProcessingService(
                customTopic, paymentRepository, kafkaTemplate, paymentMetrics
        );

        given(paymentRepository.findByOrderId("order-1")).willReturn(Optional.empty());
        given(paymentRepository.save(any())).willAnswer(inv -> inv.getArgument(0));

        service.processPayment("order-1", "user-1", 10000L);

        verify(kafkaTemplate).send(eq(customTopic), any(), any());
    }

    @Test
    @DisplayName("PaymentRefundService에 주입된 토픽명으로 이벤트가 발행된다")
    void refundPayment_usesInjectedTopic() {
        String customTopic = "custom.payment.refunded";
        PaymentRefundService service = new PaymentRefundService(
                customTopic, paymentRepository, kafkaTemplate, paymentMetrics
        );

        Payment payment = Payment.create("order-1", "user-1", 10000L);
        payment.complete();
        given(paymentRepository.findByOrderId("order-1")).willReturn(Optional.of(payment));
        given(paymentRepository.save(any())).willAnswer(inv -> inv.getArgument(0));

        service.refundPayment("order-1");

        verify(kafkaTemplate).send(eq(customTopic), any(), any());
    }
}
