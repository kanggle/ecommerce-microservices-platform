package com.example.payment.domain.model;

import com.example.payment.domain.exception.InvalidPaymentException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.*;

@DisplayName("Payment 애그리거트 단위 테스트")
class PaymentTest {

    @Test
    @DisplayName("create 호출 시 PENDING 상태로 생성된다")
    void create_returnsPendingPayment() {
        Payment payment = Payment.create("order-1", "user-1", 30000L);

        assertThat(payment.getPaymentId()).isNotNull();
        assertThat(payment.getOrderId()).isEqualTo("order-1");
        assertThat(payment.getUserId()).isEqualTo("user-1");
        assertThat(payment.getAmount()).isEqualTo(30000L);
        assertThat(payment.getStatus()).isEqualTo(PaymentStatus.PENDING);
        assertThat(payment.getPaidAt()).isNull();
        assertThat(payment.getRefundedAt()).isNull();
    }

    @Test
    @DisplayName("PENDING 상태에서 complete 호출 시 COMPLETED로 전이된다")
    void complete_pendingPayment_becomesCompleted() {
        Payment payment = Payment.create("order-1", "user-1", 30000L);

        payment.complete();

        assertThat(payment.getStatus()).isEqualTo(PaymentStatus.COMPLETED);
        assertThat(payment.getPaidAt()).isNotNull();
    }

    @Test
    @DisplayName("COMPLETED 상태에서 complete 호출 시 멱등 처리된다")
    void complete_alreadyCompleted_isIdempotent() {
        Payment payment = Payment.create("order-1", "user-1", 30000L);
        payment.complete();

        assertThatNoException().isThrownBy(payment::complete);
        assertThat(payment.getStatus()).isEqualTo(PaymentStatus.COMPLETED);
    }

    @Test
    @DisplayName("FAILED 상태에서 complete 호출 시 예외가 발생한다")
    void complete_failedPayment_throwsInvalidPaymentException() {
        Payment payment = Payment.create("order-1", "user-1", 30000L);
        // FAILED 상태로 강제 전이할 방법이 없으므로 REFUNDED 이후 complete 시도
        payment.complete();
        payment.refund();

        assertThatThrownBy(payment::complete)
                .isInstanceOf(InvalidPaymentException.class);
    }

    @Test
    @DisplayName("COMPLETED 상태에서 refund 호출 시 REFUNDED로 전이된다")
    void refund_completedPayment_becomesRefunded() {
        Payment payment = Payment.create("order-1", "user-1", 30000L);
        payment.complete();

        payment.refund();

        assertThat(payment.getStatus()).isEqualTo(PaymentStatus.REFUNDED);
        assertThat(payment.getRefundedAt()).isNotNull();
    }

    @Test
    @DisplayName("REFUNDED 상태에서 refund 호출 시 멱등 처리된다")
    void refund_alreadyRefunded_isIdempotent() {
        Payment payment = Payment.create("order-1", "user-1", 30000L);
        payment.complete();
        payment.refund();
        LocalDateTime firstRefundedAt = payment.getRefundedAt();

        assertThatNoException().isThrownBy(payment::refund);
        assertThat(payment.getStatus()).isEqualTo(PaymentStatus.REFUNDED);
        assertThat(payment.getRefundedAt()).isEqualTo(firstRefundedAt);
    }

    @Test
    @DisplayName("PENDING 상태에서 refund 호출 시 예외가 발생한다")
    void refund_pendingPayment_throwsInvalidPaymentException() {
        Payment payment = Payment.create("order-1", "user-1", 30000L);

        assertThatThrownBy(payment::refund)
                .isInstanceOf(InvalidPaymentException.class);
    }

    @Test
    @DisplayName("reconstitute로 복원된 Payment는 모든 필드를 유지한다")
    void reconstitute_restoresAllFields() {
        LocalDateTime now = LocalDateTime.now();
        Payment payment = Payment.reconstitute(
                "pay-1", "order-1", "user-1", 50000L,
                PaymentStatus.COMPLETED, now, now.plusMinutes(1), null
        );

        assertThat(payment.getPaymentId()).isEqualTo("pay-1");
        assertThat(payment.getOrderId()).isEqualTo("order-1");
        assertThat(payment.getUserId()).isEqualTo("user-1");
        assertThat(payment.getAmount()).isEqualTo(50000L);
        assertThat(payment.getStatus()).isEqualTo(PaymentStatus.COMPLETED);
        assertThat(payment.getCreatedAt()).isEqualTo(now);
        assertThat(payment.getPaidAt()).isEqualTo(now.plusMinutes(1));
        assertThat(payment.getRefundedAt()).isNull();
    }

    @Test
    @DisplayName("도메인 모델에 JPA 의존성이 없다")
    void domainModel_hasNoJpaDependency() {
        Class<Payment> clazz = Payment.class;

        assertThat(clazz.getAnnotations())
                .noneMatch(a -> a.annotationType().getPackageName().startsWith("jakarta.persistence"));
    }
}
