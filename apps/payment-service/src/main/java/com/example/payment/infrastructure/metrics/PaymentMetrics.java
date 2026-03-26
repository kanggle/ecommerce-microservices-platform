package com.example.payment.infrastructure.metrics;

import com.example.observability.metrics.EventMetricNames;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import org.springframework.stereotype.Component;

import java.util.Objects;

@Component
public class PaymentMetrics {

    private final Counter paymentCreatedTotal;
    private final Counter paymentCompletedTotal;
    private final Counter paymentRefundedTotal;
    private final MeterRegistry registry;

    public PaymentMetrics(MeterRegistry registry) {
        Objects.requireNonNull(registry, "MeterRegistry must not be null");
        this.registry = registry;

        this.paymentCreatedTotal = Counter.builder("payment_created_total")
                .description("Total payments created")
                .register(registry);

        this.paymentCompletedTotal = Counter.builder("payment_completed_total")
                .description("Total payments successfully completed")
                .register(registry);

        this.paymentRefundedTotal = Counter.builder("payment_refunded_total")
                .description("Total refunds processed")
                .register(registry);
    }

    public void incrementPaymentCreated() {
        paymentCreatedTotal.increment();
    }

    public void incrementPaymentCompleted() {
        paymentCompletedTotal.increment();
    }

    public void incrementPaymentFailed(String reason) {
        Counter.builder("payment_failed_total")
                .description("Total payment failures by reason")
                .tag("reason", reason)
                .register(registry)
                .increment();
    }

    public void incrementPaymentRefunded() {
        paymentRefundedTotal.increment();
    }

    public void addPaymentAmount(long amount) {
        Counter.builder("payment_amount_sum")
                .description("Cumulative payment amount processed")
                .register(registry)
                .increment(amount);
    }

    public void incrementEventPublishFailure(String eventType) {
        registry.counter(EventMetricNames.EVENT_PUBLISH_FAILURE_TOTAL,
                EventMetricNames.TAG_SERVICE, "payment-service",
                EventMetricNames.TAG_EVENT_TYPE, eventType)
                .increment();
    }

    public void incrementEventConsumeFailure(String eventType) {
        registry.counter(EventMetricNames.EVENT_CONSUME_FAILURE_TOTAL,
                EventMetricNames.TAG_SERVICE, "payment-service",
                EventMetricNames.TAG_EVENT_TYPE, eventType)
                .increment();
    }
}
