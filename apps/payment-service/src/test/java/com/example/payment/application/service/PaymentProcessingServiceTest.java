package com.example.payment.application.service;

import ch.qos.logback.classic.Level;
import ch.qos.logback.classic.Logger;
import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.core.read.ListAppender;
import com.example.payment.application.event.PaymentCompletedEvent;
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
@DisplayName("PaymentProcessingService 단위 테스트")
class PaymentProcessingServiceTest {

    private static final String TOPIC = "payment.payment.completed";

    private PaymentProcessingService paymentProcessingService;

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
        paymentProcessingService = new PaymentProcessingService(
                TOPIC, paymentRepository, kafkaTemplate, paymentMetrics
        );
        logger = (Logger) LoggerFactory.getLogger(PaymentProcessingService.class);
        listAppender = new ListAppender<>();
        listAppender.start();
        logger.addAppender(listAppender);
    }

    @AfterEach
    void tearDownLogCapture() {
        logger.detachAppender(listAppender);
    }

    @Test
    @DisplayName("OrderPlaced 처리 시 Payment가 COMPLETED 상태로 저장되고 이벤트가 발행된다")
    void processPayment_newOrder_savesCompletedPaymentAndPublishesEvent() {
        given(paymentRepository.findByOrderId("order-1")).willReturn(Optional.empty());
        given(paymentRepository.save(any())).willAnswer(inv -> inv.getArgument(0));

        paymentProcessingService.processPayment("order-1", "user-1", 30000L);

        ArgumentCaptor<Payment> paymentCaptor = ArgumentCaptor.forClass(Payment.class);
        verify(paymentRepository).save(paymentCaptor.capture());
        assertThat(paymentCaptor.getValue().getStatus()).isEqualTo(PaymentStatus.COMPLETED);
        assertThat(paymentCaptor.getValue().getOrderId()).isEqualTo("order-1");

        ArgumentCaptor<PaymentCompletedEvent> eventCaptor = ArgumentCaptor.forClass(PaymentCompletedEvent.class);
        verify(kafkaTemplate).send(eq(TOPIC), any(), eventCaptor.capture());
        assertThat(eventCaptor.getValue().eventType()).isEqualTo("PaymentCompleted");
        assertThat(eventCaptor.getValue().payload().orderId()).isEqualTo("order-1");
    }

    @Test
    @DisplayName("동일 orderId에 대해 이미 Payment가 존재하면 처리를 생략한다 (멱등)")
    void processPayment_duplicateOrder_skipsProcessing() {
        Payment existing = Payment.create("order-1", "user-1", 30000L);
        given(paymentRepository.findByOrderId("order-1")).willReturn(Optional.of(existing));

        paymentProcessingService.processPayment("order-1", "user-1", 30000L);

        verify(paymentRepository, never()).save(any());
        verify(kafkaTemplate, never()).send(any(), any(), any());
    }

    @Test
    @DisplayName("Kafka 이벤트 발행 실패 시 event_publish_failure_total 메트릭이 증가한다")
    void processPayment_kafkaFailure_incrementsEventPublishFailureMetric() {
        given(paymentRepository.findByOrderId("order-1")).willReturn(Optional.empty());
        given(paymentRepository.save(any())).willAnswer(inv -> inv.getArgument(0));
        given(kafkaTemplate.send(any(), any(), any())).willThrow(new KafkaException("Kafka broker unavailable"));

        paymentProcessingService.processPayment("order-1", "user-1", 30000L);

        verify(paymentMetrics).incrementEventPublishFailure("PaymentCompleted");
    }

    @Test
    @DisplayName("Kafka 이벤트 발행 실패 시 ERROR 레벨로 로그가 기록된다")
    void processPayment_kafkaFailure_logsAtErrorLevel() {
        given(paymentRepository.findByOrderId("order-1")).willReturn(Optional.empty());
        given(paymentRepository.save(any())).willAnswer(inv -> inv.getArgument(0));
        given(kafkaTemplate.send(any(), any(), any())).willThrow(new KafkaException("Kafka broker unavailable"));

        paymentProcessingService.processPayment("order-1", "user-1", 30000L);

        assertThat(listAppender.list)
                .filteredOn(e -> e.getLevel() == Level.ERROR)
                .anyMatch(e -> e.getFormattedMessage().contains("Event publishing failed")
                        && e.getFormattedMessage().contains("PaymentCompleted"));
    }
}
