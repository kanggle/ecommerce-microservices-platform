# Skill: Event Implementation

Patterns for implementing domain events with Kafka in this repository.

Prerequisite: read `specs/platform/event-driven-policy.md` and `specs/contracts/events/` for event schemas before using this skill.

---

## Event Envelope

All events follow a standard envelope format:

```java
public record ProductEvent(
    UUID eventId,
    String eventType,
    Instant occurredAt,
    ProductEventPayload payload
) {
    public static ProductEvent of(String eventType, ProductEventPayload payload) {
        return new ProductEvent(UUID.randomUUID(), eventType, Instant.now(), payload);
    }
}
```

---

## Event Publisher Interface

Define in the application/domain layer. Implement in infrastructure.

```java
// application layer — port
public interface ProductEventPublisher {
    void publish(ProductEvent event);
}
```

```java
// infrastructure layer — Kafka adapter
@Slf4j
@Component
@Profile("!standalone")
@RequiredArgsConstructor
public class KafkaProductEventPublisher implements ProductEventPublisher {

    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final ProductMetrics productMetrics;

    @Override
    public void publish(ProductEvent event) {
        String topic = resolveTopic(event.eventType());
        String key = event.eventId().toString();
        try {
            kafkaTemplate.send(topic, key, event);
        } catch (Exception e) {
            log.error("Event publishing failed: eventType={}, topic={}", event.eventType(), topic, e);
            productMetrics.incrementEventPublishFailure(event.eventType());
        }
    }

    private String resolveTopic(String eventType) {
        return switch (eventType) {
            case "ProductCreated" -> "product.product.created";
            case "ProductUpdated" -> "product.product.updated";
            case "ProductDeleted" -> "product.product.deleted";
            case "StockChanged"   -> "product.product.stock-changed";
            default -> throw new IllegalArgumentException("Unknown event type: " + eventType);
        };
    }
}
```

---

## Standalone No-op Publisher

For local dev without Kafka:

```java
@Slf4j
@Component
@Profile("standalone")
public class NoopProductEventPublisher implements ProductEventPublisher {
    @Override
    public void publish(ProductEvent event) {
        log.debug("Standalone mode — skipping event: {}", event.eventType());
    }
}
```

---

## Topic Naming Convention

Pattern: `{source-service}.{aggregate}.{event-name}`

Examples:
- `product.product.created`
- `order.order.placed`
- `order.order.cancelled`

---

## Event Consumer

```java
@Slf4j
@Component
@RequiredArgsConstructor
public class OrderPlacedEventConsumer {

    private final PaymentProcessingService paymentProcessingService;
    private final ObjectMapper objectMapper;

    @KafkaListener(topics = "order.order.placed", groupId = "${spring.application.name}")
    public void onMessage(@Payload String payload) throws JsonProcessingException {
        OrderPlacedEvent event = objectMapper.readValue(payload, OrderPlacedEvent.class);
        if (event.payload() == null) {
            log.warn("Null payload, skipping. eventId={}", event.eventId());
            return;
        }
        paymentProcessingService.processPayment(
            event.payload().orderId(),
            event.payload().userId(),
            event.payload().totalPrice()
        );
    }
}
```

---

## Common Pitfalls

| Pitfall | Fix |
|---|---|
| Publishing event outside transaction | Use outbox pattern (see `messaging/outbox-pattern.md`) |
| Missing `@Profile("!standalone")` on Kafka publisher | Standalone mode will fail without Kafka |
| Hardcoded group ID | Use `${spring.application.name}` for group ID |
| No null-payload guard in consumer | Always check `event.payload() != null` |
| Missing error metrics on publish failure | Record failure metrics for observability |
