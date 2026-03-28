package com.example.review.infrastructure.client;

import com.example.review.application.port.PurchaseVerificationPort;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.UUID;

@Slf4j
@Component
public class OrderServiceClient implements PurchaseVerificationPort {

    private final RestClient restClient;

    public OrderServiceClient(@Value("${order-service.base-url}") String baseUrl) {
        this.restClient = RestClient.builder()
                .baseUrl(baseUrl)
                .build();
    }

    @Override
    public boolean hasUserPurchasedProduct(UUID userId, UUID productId) {
        try {
            OrderListResponse response = restClient.get()
                    .uri("/api/orders?status=DELIVERED&page=0&size=100")
                    .header("X-User-Id", userId.toString())
                    .retrieve()
                    .body(OrderListResponse.class);

            if (response == null || response.content() == null) {
                return false;
            }

            return response.content().stream()
                    .anyMatch(order -> hasProduct(order, userId, productId));
        } catch (Exception e) {
            log.error("Failed to verify purchase for user={} product={}", userId, productId, e);
            throw new RuntimeException("Purchase verification failed: order-service unavailable", e);
        }
    }

    private boolean hasProduct(OrderSummary order, UUID userId, UUID productId) {
        try {
            OrderDetailResponse detail = restClient.get()
                    .uri("/api/orders/{orderId}", order.orderId())
                    .header("X-User-Id", userId.toString())
                    .retrieve()
                    .body(OrderDetailResponse.class);

            if (detail == null || detail.items() == null) {
                return false;
            }

            return detail.items().stream()
                    .anyMatch(item -> productId.toString().equals(item.productId()));
        } catch (Exception e) {
            log.warn("Failed to get order detail for orderId={}", order.orderId(), e);
            return false;
        }
    }

    record OrderListResponse(
            java.util.List<OrderSummary> content,
            int page,
            int size,
            long totalElements
    ) {}

    record OrderSummary(
            String orderId,
            String status,
            long totalPrice,
            int itemCount,
            String createdAt
    ) {}

    record OrderDetailResponse(
            String orderId,
            String status,
            long totalPrice,
            java.util.List<OrderItem> items,
            String createdAt,
            String updatedAt
    ) {}

    record OrderItem(
            String productId,
            String variantId,
            String productName,
            String optionName,
            int quantity,
            long unitPrice
    ) {}
}
