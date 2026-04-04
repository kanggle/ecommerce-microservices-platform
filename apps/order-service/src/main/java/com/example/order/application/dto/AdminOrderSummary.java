package com.example.order.application.dto;

import com.example.order.domain.model.Order;

import java.time.Instant;

public record AdminOrderSummary(
        String orderId,
        String userId,
        String status,
        long totalPrice,
        int itemCount,
        Instant createdAt
) {
    public static AdminOrderSummary from(Order order) {
        return new AdminOrderSummary(
                order.getOrderId(),
                order.getUserId(),
                order.getStatus().name(),
                order.getTotalPrice(),
                order.getItems().size(),
                order.getCreatedAt()
        );
    }
}
