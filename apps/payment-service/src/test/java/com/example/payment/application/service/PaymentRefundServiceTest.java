package com.example.payment.application.service;

import ch.qos.logback.classic.Level;
import ch.qos.logback.classic.Logger;
import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.core.read.ListAppender;
import com.example.payment.application.event.PaymentRefundedEvent;
import com.example.payment.domain.model.Payment;
import com.example.payment.domain.model.PaymentStatus;
import com.example.payment.domain.repository.PaymentRepository;
import com.example.payment.infrastructure.metrics.PaymentMetrics;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.KafkaException;
import org.springframework.kafka.core.KafkaTemplate;

import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("PaymentRefundService 단위 테스트")
class PaymentRefundServiceTest {

    private static final String TOPIC = "payment.payment.refunded";

    private PaymentRefundService paymentRefundService;

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private KafkaTemplate<String, Object> kafkaTemplate;

    @Mock
    private PaymentMetrics paymentMetrics;

    private ListAppender<ILoggingEvent> listAppender;
    private Logger logger;

    @BeforeEach
    void setUpLogCapture() {
        paymentRefundService = new PaymentRefundService(
                TOPIC, paymentRepository, kafkaTemplate, paymentMetrics
        );
        logger = (Logger) LoggerFactory.getLogger(PaymentRefundService.class);
        listAppender = new ListAppender<>();
        listAppender.start();
        logger.addAppender(listAppender);
    }

    @AfterEach
    void tearDownLogCapture() {
        logger.detachAppender(listAppender);
    }

    private Payment completedPayment() {
        Payment p = Payment.create("order-1", "user-1", 30000L);
        p.complete();
        return p;
    }

    @Test
    @DisplayName("COMPLETED 결제 환불 시 REFUNDED 상태로 저장되고 이벤트가 발행된다")
    void refundPayment_completed_savesRefundedAndPublishesEvent() {
        Payment payment = completedPayment();
        given(paymentRepository.findByOrderId("order-1")).willReturn(Optional.of(payment));
        given(paymentRepository.save(any())).willAnswer(inv -> inv.getArgument(0));

        paymentRefundService.refundPayment("order-1");

        ArgumentCaptor<Payment> captor = ArgumentCaptor.forClass(Payment.class);
        verify(paymentRepository).save(captor.capture());
        assertThat(captor.getValue().getStatus()).isEqualTo(PaymentStatus.REFUNDED);

        ArgumentCaptor<PaymentRefundedEvent> eventCaptor = ArgumentCaptor.forClass(PaymentRefundedEvent.class);
        verify(kafkaTemplate).send(eq(TOPIC), any(), eventCaptor.capture());
        assertThat(eventCaptor.getValue().eventType()).isEqualTo("PaymentRefunded");
        assertThat(eventCaptor.getValue().payload().orderId()).isEqualTo("order-1");
    }

    @Test
    @DisplayName("이미 REFUNDED 상태이면 멱등 처리한다 (저장/이벤트 없음, WARN 로그)")
    void refundPayment_alreadyRefunded_isIdempotent() {
        Payment payment = completedPayment();
        payment.refund();
        given(paymentRepository.findByOrderId("order-1")).willReturn(Optional.of(payment));

        paymentRefundService.refundPayment("order-1");

        verify(paymentRepository, never()).save(any());
        verify(kafkaTemplate, never()).send(any(), any(), any());
        assertThat(listAppender.list)
                .filteredOn(e -> e.getLevel() == Level.WARN)
                .anyMatch(e -> e.getFormattedMessage().contains("Duplicate refund attempt")
                        && e.getFormattedMessage().contains("order-1"));
    }

    @Test
    @DisplayName("Payment가 없는 orderId이면 무시한다")
    void refundPayment_noPayment_skips() {
        given(paymentRepository.findByOrderId("order-x")).willReturn(Optional.empty());

        paymentRefundService.refundPayment("order-x");

        verify(paymentRepository, never()).save(any());
        verify(kafkaTemplate, never()).send(any(), any(), any());
    }

    @Test
    @DisplayName("Kafka 이벤트 발행 실패 시 event_publish_failure_total 메트릭이 증가한다")
    void refundPayment_kafkaFailure_incrementsEventPublishFailureMetric() {
        Payment payment = completedPayment();
        given(paymentRepository.findByOrderId("order-1")).willReturn(Optional.of(payment));
        given(paymentRepository.save(any())).willAnswer(inv -> inv.getArgument(0));
        given(kafkaTemplate.send(any(), any(), any())).willThrow(new KafkaException("Kafka broker unavailable"));

        paymentRefundService.refundPayment("order-1");

        verify(paymentMetrics).incrementEventPublishFailure("PaymentRefunded");
    }

    @Test
    @DisplayName("Kafka 이벤트 발행 실패 시 ERROR 레벨로 로그가 기록된다")
    void refundPayment_kafkaFailure_logsAtErrorLevel() {
        Payment payment = completedPayment();
        given(paymentRepository.findByOrderId("order-1")).willReturn(Optional.of(payment));
        given(paymentRepository.save(any())).willAnswer(inv -> inv.getArgument(0));
        given(kafkaTemplate.send(any(), any(), any())).willThrow(new KafkaException("Kafka broker unavailable"));

        paymentRefundService.refundPayment("order-1");

        assertThat(listAppender.list)
                .filteredOn(e -> e.getLevel() == Level.ERROR)
                .anyMatch(e -> e.getFormattedMessage().contains("Event publishing failed")
                        && e.getFormattedMessage().contains("PaymentRefunded"));
    }
}
