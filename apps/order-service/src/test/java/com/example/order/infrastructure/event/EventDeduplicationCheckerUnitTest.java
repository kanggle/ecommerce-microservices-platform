package com.example.order.infrastructure.event;

import com.example.messaging.dedupe.EventDedupePort;
import com.example.order.infrastructure.persistence.ProcessedEventJpaEntity;
import com.example.order.infrastructure.persistence.ProcessedEventJpaRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

/**
 * Unit tests for {@link EventDeduplicationChecker} as an {@link EventDedupePort} adapter
 * (ADR-MONO-058 D7, TASK-BE-569). Pins the {@code process(...)} contract over the locally
 * owned {@code String}-keyed {@code processed_events} table.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("EventDeduplicationChecker (EventDedupePort 어댑터) 단위 테스트")
class EventDeduplicationCheckerUnitTest {

    @InjectMocks
    private EventDeduplicationChecker checker;

    @Mock
    private ProcessedEventJpaRepository processedEventJpaRepository;

    @Test
    @DisplayName("새로운 eventId는 work를 실행하고 APPLIED를 반환한다")
    void process_newEventId_runsWorkAndReturnsApplied() {
        UUID eventId = UUID.randomUUID();
        when(processedEventJpaRepository.existsByEventId(eventId.toString())).thenReturn(false);
        AtomicInteger counter = new AtomicInteger();

        EventDedupePort.Outcome outcome = checker.process(eventId, "PaymentCompleted", counter::incrementAndGet);

        assertThat(outcome).isEqualTo(EventDedupePort.Outcome.APPLIED);
        assertThat(counter.get()).isEqualTo(1);
        verify(processedEventJpaRepository).save(any(ProcessedEventJpaEntity.class));
    }

    @Test
    @DisplayName("이미 처리된 eventId는 work를 재실행하지 않고 IGNORED_DUPLICATE를 반환한다")
    void process_existingEventId_skipsWorkAndReturnsIgnored() {
        UUID eventId = UUID.randomUUID();
        when(processedEventJpaRepository.existsByEventId(eventId.toString())).thenReturn(true);
        AtomicInteger counter = new AtomicInteger();

        EventDedupePort.Outcome outcome = checker.process(eventId, "PaymentCompleted", counter::incrementAndGet);

        assertThat(outcome).isEqualTo(EventDedupePort.Outcome.IGNORED_DUPLICATE);
        assertThat(counter.get()).isZero();
        verify(processedEventJpaRepository, never()).save(any());
    }

    /*
     * TASK-BE-541 removed the test that used to sit here
     * ("동시 INSERT로 UNIQUE 제약 위반 시 중복으로 판단한다"). It stubbed
     * processedEventJpaRepository.save(...) to throw DataIntegrityViolationException and
     * asserted the checker returned true — but the real repository never throws from
     * save(): ProcessedEventJpaEntity has an assigned @Id, so the INSERT is queued until
     * the commit-time flush, which runs after process() returns. The production catch
     * it exercised was unreachable, and this test is the reason nobody noticed.
     *
     * The catch is gone (see EventDeduplicationChecker). The concurrent-duplicate case is
     * now documented as being resolved by consumer retry, not by a catch, and that is a
     * transaction-boundary behaviour a Mockito unit test cannot express — asserting it
     * requires a real database and a real commit. It belongs in the integration lane, not
     * here. A replacement unit test would only re-create the same false confidence.
     */

    @Test
    @DisplayName("eventId가 null이면 중복 체크를 건너뛰고 work를 실행한다")
    void process_nullEventId_skipsDedupeButRunsWork() {
        AtomicInteger counter = new AtomicInteger();

        EventDedupePort.Outcome outcome = checker.process(null, "PaymentCompleted", counter::incrementAndGet);

        assertThat(outcome).isEqualTo(EventDedupePort.Outcome.APPLIED);
        assertThat(counter.get()).isEqualTo(1);
        verify(processedEventJpaRepository, never()).existsByEventId(any());
        verify(processedEventJpaRepository, never()).save(any());
    }
}
