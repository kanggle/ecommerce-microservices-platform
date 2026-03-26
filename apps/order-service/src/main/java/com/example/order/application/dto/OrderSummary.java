package com.example.order.application.dto;

import com.example.order.domain.model.Order;

import java.time.Instant;

public record OrderSummary(
        String orderId,
        String status,
        long totalPrice,
        int itemCount,
        Instant createdAt
) {
    public static OrderSummary from(Order order) {
        return new OrderSummary(
                order.getOrderId(),
                order.getStatus().name(),
                order.getTotalPrice(),
                order.getItems().size(),
                order.getCreatedAt()
        );
    }
}
