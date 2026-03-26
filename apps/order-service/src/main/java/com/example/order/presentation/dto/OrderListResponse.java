package com.example.order.presentation.dto;

import com.example.order.application.dto.OrderSummary;
import org.springframework.data.domain.Page;

import java.time.Instant;
import java.util.List;

public record OrderListResponse(
        List<OrderSummaryItem> content,
        int page,
        int size,
        long totalElements
) {
    public static OrderListResponse from(Page<OrderSummary> page) {
        List<OrderSummaryItem> items = page.getContent().stream()
                .map(s -> new OrderSummaryItem(
                        s.orderId(), s.status(), s.totalPrice(), s.itemCount(), s.createdAt()
                ))
                .toList();
        return new OrderListResponse(items, page.getNumber(), page.getSize(), page.getTotalElements());
    }

    public record OrderSummaryItem(
            String orderId,
            String status,
            long totalPrice,
            int itemCount,
            Instant createdAt
    ) {}
}
