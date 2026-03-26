package com.example.product.domain.event;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.Instant;
import java.util.UUID;

public record ProductEvent(
        @JsonProperty("event_id") UUID eventId,
        @JsonProperty("event_type") String eventType,
        @JsonProperty("occurred_at") Instant occurredAt,
        String source,
        EventPayload payload
) {
    public static ProductEvent created(ProductCreatedPayload payload) {
        return new ProductEvent(
                UUID.randomUUID(),
                "ProductCreated",
                Instant.now(),
                "product-service",
                payload
        );
    }

    public static ProductEvent updated(ProductUpdatedPayload payload) {
        return new ProductEvent(
                UUID.randomUUID(),
                "ProductUpdated",
                Instant.now(),
                "product-service",
                payload
        );
    }

    public static ProductEvent deleted(ProductDeletedPayload payload) {
        return new ProductEvent(
                UUID.randomUUID(),
                "ProductDeleted",
                Instant.now(),
                "product-service",
                payload
        );
    }

    public static ProductEvent stockChanged(StockChangedPayload payload) {
        return new ProductEvent(
                UUID.randomUUID(),
                "StockChanged",
                Instant.now(),
                "product-service",
                payload
        );
    }
}
