package com.example.order.infrastructure.config;

import com.example.order.application.event.OrderCancelledEvent;
import com.example.order.application.event.OrderPlacedEvent;
import com.example.order.application.port.OrderEventPublisher;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.http.MediaType;
import org.springframework.web.client.RestClient;

import java.util.Map;

@Slf4j
@Configuration
@Profile("standalone")
public class StandaloneConfig {

    @Bean
    OrderEventPublisher standaloneOrderEventPublisher(
            @Value("${services.payment-service.url:http://localhost:8087}") String paymentServiceUrl
    ) {
        RestClient restClient = RestClient.builder()
                .baseUrl(paymentServiceUrl)
                .build();

        return new OrderEventPublisher() {
            @Override
            public void publishOrderPlaced(OrderPlacedEvent event) {
                OrderPlacedEvent.Payload payload = event.payload();
                try {
                    restClient.post()
                            .uri("/api/payments")
                            .contentType(MediaType.APPLICATION_JSON)
                            .body(Map.of(
                                    "orderId", payload.orderId(),
                                    "userId", payload.userId(),
                                    "amount", payload.totalPrice()
                            ))
                            .retrieve()
                            .toBodilessEntity();
                    log.info("[standalone] Payment created for orderId={}", payload.orderId());
                } catch (Exception e) {
                    log.error("[standalone] Failed to create payment for orderId={}: {}",
                            payload.orderId(), e.getMessage());
                }
            }

            @Override
            public void publishOrderCancelled(OrderCancelledEvent event) {
                log.debug("[standalone] OrderCancelled event (no-op): {}", event.payload().orderId());
            }
        };
    }
}
