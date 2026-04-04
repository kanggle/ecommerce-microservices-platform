# Skill: Consumer Retry & DLQ

Patterns for Kafka consumer retry and dead-letter queue handling.

Prerequisite: read `specs/platform/event-driven-policy.md` before using this skill.

---

## Retry Configuration

Use Spring Kafka's `DefaultErrorHandler` with `FixedBackOff`.

```java
@Configuration
@Profile("!standalone")
public class KafkaConsumerConfig {

    @Bean
    public DefaultErrorHandler errorHandler(KafkaTemplate<String, String> kafkaTemplate) {
        DeadLetterPublishingRecoverer recoverer =
            new DeadLetterPublishingRecoverer(kafkaTemplate);
        FixedBackOff backOff = new FixedBackOff(1000L, 3); // 1s interval, 3 retries
        return new DefaultErrorHandler(recoverer, backOff);
    }
}
```

---

## DLQ Topic Naming

Pattern: `{original-topic}.DLT`

Spring Kafka's `DeadLetterPublishingRecoverer` appends `.DLT` by default.

Examples:
- `order.order.placed` → `order.order.placed.DLT`
- `product.product.stock-changed` → `product.product.stock-changed.DLT`

---

## Consumer Error Handling

Guard against null payloads and deserialization errors.

```java
@KafkaListener(topics = "order.order.placed", groupId = "${spring.application.name}")
public void onMessage(@Payload String payload) {
    try {
        OrderPlacedEvent event = objectMapper.readValue(payload, OrderPlacedEvent.class);
        if (event.payload() == null) {
            log.warn("Null payload, skipping. eventId={}", event.eventId());
            return;
        }
        processEvent(event);
    } catch (JsonProcessingException e) {
        log.error("Failed to deserialize event, sending to DLQ", e);
        throw new RuntimeException("Deserialization failed", e);
    }
}
```

---

## Retry vs Skip vs DLQ

| Scenario | Behavior |
|---|---|
| Transient error (DB timeout, network) | Retry (up to max attempts) |
| Deserialization failure | Throw → DLQ after retries exhausted |
| Null payload | Log and skip (return without processing) |
| Business rule violation | Throw → DLQ after retries exhausted |
| Duplicate event (idempotent) | Skip (return without processing) |

---

## Testing DLQ Behavior

```java
@Test
@DisplayName("Malformed event is routed to DLQ after retries")
void malformedEvent_routedToDlq() {
    kafkaTemplate.send(topic, "invalid-json");

    await().atMost(Duration.ofSeconds(10)).untilAsserted(() -> {
        ConsumerRecords<String, String> dlqRecords = pollDlqTopic();
        assertThat(dlqRecords.count()).isGreaterThanOrEqualTo(1);
    });
}
```

---

## Common Pitfalls

| Pitfall | Fix |
|---|---|
| Catching all exceptions silently in consumer | Let retriable errors propagate to trigger retry |
| No DLQ configured | Always configure `DeadLetterPublishingRecoverer` |
| Infinite retries | Use bounded `FixedBackOff` or `ExponentialBackOff` |
| Retrying non-retriable errors | Skip or throw to DLQ for deserialization/validation errors |
