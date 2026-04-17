package com.example.product.domain.event;

public record ProductImagesUpdatedPayload(
        String productId,
        String thumbnailUrl
) implements EventPayload {

    public static ProductImagesUpdatedPayload of(String productId, String thumbnailUrl) {
        return new ProductImagesUpdatedPayload(productId, thumbnailUrl);
    }
}
