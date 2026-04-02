package com.example.payment.config;

import com.example.payment.application.event.PaymentCompletedEvent;
import com.example.payment.application.event.PaymentRefundedEvent;
import com.example.payment.application.port.out.PaymentEventPublisher;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

@Slf4j
@Configuration
@Profile("standalone")
public class StandaloneConfig {

    @Bean
    PaymentEventPublisher noOpPaymentEventPublisher() {
        return new PaymentEventPublisher() {
            @Override
            public void publishPaymentCompleted(PaymentCompletedEvent event) {
                log.debug("[standalone] Payment completed event (no-op): {}", event);
            }

            @Override
            public void publishPaymentRefunded(PaymentRefundedEvent event) {
                log.debug("[standalone] Payment refunded event (no-op): {}", event);
            }
        };
    }
}
