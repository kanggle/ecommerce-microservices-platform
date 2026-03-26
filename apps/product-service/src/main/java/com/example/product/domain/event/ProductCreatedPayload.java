package com.example.product.domain.event;

import java.util.List;

public record ProductCreatedPayload(
        String productId,
        String name,
        String description,
        long price,
        String status,
        String categoryId,
        List<VariantPayload> variants
) implements EventPayload {
    public record VariantPayload(
            String variantId,
            String optionName,
            int stock,
            long additionalPrice
    ) {}
}
