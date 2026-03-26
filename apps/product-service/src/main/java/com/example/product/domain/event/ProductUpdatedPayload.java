package com.example.product.domain.event;

public record ProductUpdatedPayload(
        String productId,
        String name,
        String description,
        long price,
        String status,
        String categoryId
) implements EventPayload {}
