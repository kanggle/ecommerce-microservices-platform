package com.example.shipping.infrastructure.config;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.listener.CommonErrorHandler;
import org.springframework.kafka.listener.DefaultErrorHandler;

import static org.assertj.core.api.Assertions.assertThat;

@ExtendWith(MockitoExtension.class)
@DisplayName("KafkaConsumerConfig 단위 테스트")
class KafkaConsumerConfigTest {

    @Mock
    private KafkaTemplate<String, String> kafkaTemplate;

    @Test
    @DisplayName("kafkaErrorHandler가 DefaultErrorHandler 인스턴스를 반환한다")
    void kafkaErrorHandler_returnsDefaultErrorHandler() {
        KafkaConsumerConfig config = new KafkaConsumerConfig();

        CommonErrorHandler errorHandler = config.kafkaErrorHandler(kafkaTemplate);

        assertThat(errorHandler).isNotNull();
        assertThat(errorHandler).isInstanceOf(DefaultErrorHandler.class);
    }

    @Test
    @DisplayName("not-retryable 예외로 분류된 예외는 재시도하지 않는다")
    void kafkaErrorHandler_notRetryableExceptionsClassified() {
        KafkaConsumerConfig config = new KafkaConsumerConfig();

        DefaultErrorHandler errorHandler = (DefaultErrorHandler) config.kafkaErrorHandler(kafkaTemplate);

        // DefaultErrorHandler classifies JsonProcessingException and IllegalArgumentException as not-retryable
        // These exceptions should be sent directly to DLQ without retry
        assertThat(errorHandler.getClassifier().classify(new IllegalArgumentException("test"))).isFalse();
        assertThat(errorHandler.getClassifier().classify(
                new com.fasterxml.jackson.core.JsonProcessingException("test") {})).isFalse();
    }

    @Test
    @DisplayName("retryable 예외는 재시도 대상으로 분류된다")
    void kafkaErrorHandler_retryableExceptionsClassified() {
        KafkaConsumerConfig config = new KafkaConsumerConfig();

        DefaultErrorHandler errorHandler = (DefaultErrorHandler) config.kafkaErrorHandler(kafkaTemplate);

        // RuntimeException (not in the not-retryable list) should be retryable
        assertThat(errorHandler.getClassifier().classify(new RuntimeException("transient error"))).isTrue();
    }
}
