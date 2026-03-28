package com.example.review.domain.event;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.Instant;
import java.util.UUID;

public record ReviewEvent(
        @JsonProperty("event_id") UUID eventId,
        @JsonProperty("event_type") String eventType,
        @JsonProperty("occurred_at") Instant occurredAt,
        String source,
        ReviewEventPayload payload
) {
    public static ReviewEvent created(ReviewCreatedPayload payload) {
        return of("ReviewCreated", payload);
    }

    public static ReviewEvent updated(ReviewUpdatedPayload payload) {
        return of("ReviewUpdated", payload);
    }

    public static ReviewEvent deleted(ReviewDeletedPayload payload) {
        return of("ReviewDeleted", payload);
    }

    private static ReviewEvent of(String eventType, ReviewEventPayload payload) {
        return new ReviewEvent(UUID.randomUUID(), eventType, Instant.now(), "review-service", payload);
    }
}
