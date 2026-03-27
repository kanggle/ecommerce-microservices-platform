package com.example.payment.config;

import com.fasterxml.jackson.core.JsonProcessingException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.classify.BinaryExceptionClassifier;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.listener.CommonErrorHandler;
import org.springframework.kafka.listener.DefaultErrorHandler;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.util.backoff.FixedBackOff;

import static org.assertj.core.api.Assertions.assertThat;

@ExtendWith(MockitoExtension.class)
@DisplayName("KafkaConsumerConfig 단위 테스트")
class KafkaConsumerConfigTest {

    @Mock
    private KafkaTemplate<String, String> kafkaTemplate;

    @Test
    @DisplayName("kafkaErrorHandler 빈이 DefaultErrorHandler 인스턴스를 반환한다")
    void kafkaErrorHandler_returnsDefaultErrorHandler() {
        KafkaConsumerConfig config = new KafkaConsumerConfig();

        CommonErrorHandler errorHandler = config.kafkaErrorHandler(kafkaTemplate);

        assertThat(errorHandler).isInstanceOf(DefaultErrorHandler.class);
    }

    @Test
    @DisplayName("FixedBackOff 재시도 간격이 1000ms, 최대 재시도 횟수가 3회로 설정된다")
    void kafkaErrorHandler_hasCorrectBackOffConfiguration() {
        KafkaConsumerConfig config = new KafkaConsumerConfig();
        DefaultErrorHandler errorHandler = (DefaultErrorHandler) config.kafkaErrorHandler(kafkaTemplate);

        Object failureTracker = ReflectionTestUtils.getField(errorHandler, "failureTracker");
        FixedBackOff backOff = (FixedBackOff) ReflectionTestUtils.getField(failureTracker, "backOff");

        assertThat(backOff).isNotNull();
        assertThat(backOff.getInterval()).isEqualTo(1000L);
        assertThat(backOff.getMaxAttempts()).isEqualTo(3L);
    }

    @Test
    @DisplayName("JsonProcessingException이 non-retryable 예외로 설정된다")
    void kafkaErrorHandler_jsonProcessingExceptionIsNotRetryable() {
        KafkaConsumerConfig config = new KafkaConsumerConfig();
        DefaultErrorHandler errorHandler = (DefaultErrorHandler) config.kafkaErrorHandler(kafkaTemplate);

        BinaryExceptionClassifier classifier = (BinaryExceptionClassifier) ReflectionTestUtils.getField(errorHandler, "classifier");

        assertThat(classifier).isNotNull();
        assertThat(classifier.classify(new JsonProcessingException("test") {})).isFalse();
    }

    @Test
    @DisplayName("일반 RuntimeException은 retryable로 분류된다")
    void kafkaErrorHandler_runtimeExceptionIsRetryable() {
        KafkaConsumerConfig config = new KafkaConsumerConfig();
        DefaultErrorHandler errorHandler = (DefaultErrorHandler) config.kafkaErrorHandler(kafkaTemplate);

        BinaryExceptionClassifier classifier = (BinaryExceptionClassifier) ReflectionTestUtils.getField(errorHandler, "classifier");

        assertThat(classifier).isNotNull();
        assertThat(classifier.classify(new RuntimeException("transient error"))).isTrue();
    }
}
