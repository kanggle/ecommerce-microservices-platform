package com.example.batch.infrastructure.persistence;

import com.example.batch.domain.model.BatchJobExecution;
import com.example.batch.domain.model.BatchJobStatus;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.Instant;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("BatchJobExecutionJpaEntity 단위 테스트")
class BatchJobExecutionJpaEntityTest {

    @Test
    @DisplayName("fromDomain으로 RUNNING 상태의 도메인 객체를 변환한다")
    void fromDomain_runningExecution_mapsAllFields() {
        BatchJobExecution execution = BatchJobExecution.start("cleanup-job");

        BatchJobExecutionJpaEntity entity = BatchJobExecutionJpaEntity.fromDomain(execution);

        assertThat(entity.getId()).isNull();
        assertThat(entity.getJobName()).isEqualTo("cleanup-job");
        assertThat(entity.getStatus()).isEqualTo(BatchJobStatus.RUNNING);
        assertThat(entity.getStartedAt()).isEqualTo(execution.getStartedAt());
        assertThat(entity.getFinishedAt()).isNull();
        assertThat(entity.getErrorMessage()).isNull();
    }

    @Test
    @DisplayName("fromDomain으로 COMPLETED 상태의 도메인 객체를 변환한다")
    void fromDomain_completedExecution_mapsAllFields() {
        Instant now = Instant.parse("2025-01-01T10:00:00Z");
        BatchJobExecution execution = BatchJobExecution.reconstitute(
                5L, "aggregate-job", BatchJobStatus.COMPLETED,
                now, now.plusSeconds(120), null);

        BatchJobExecutionJpaEntity entity = BatchJobExecutionJpaEntity.fromDomain(execution);

        assertThat(entity.getId()).isEqualTo(5L);
        assertThat(entity.getJobName()).isEqualTo("aggregate-job");
        assertThat(entity.getStatus()).isEqualTo(BatchJobStatus.COMPLETED);
        assertThat(entity.getStartedAt()).isEqualTo(now);
        assertThat(entity.getFinishedAt()).isEqualTo(now.plusSeconds(120));
        assertThat(entity.getErrorMessage()).isNull();
    }

    @Test
    @DisplayName("fromDomain으로 FAILED 상태의 도메인 객체를 변환한다")
    void fromDomain_failedExecution_mapsErrorMessage() {
        Instant now = Instant.parse("2025-01-01T10:00:00Z");
        BatchJobExecution execution = BatchJobExecution.reconstitute(
                3L, "sync-job", BatchJobStatus.FAILED,
                now, now.plusSeconds(10), "Connection refused");

        BatchJobExecutionJpaEntity entity = BatchJobExecutionJpaEntity.fromDomain(execution);

        assertThat(entity.getId()).isEqualTo(3L);
        assertThat(entity.getStatus()).isEqualTo(BatchJobStatus.FAILED);
        assertThat(entity.getErrorMessage()).isEqualTo("Connection refused");
        assertThat(entity.getFinishedAt()).isEqualTo(now.plusSeconds(10));
    }

    @Test
    @DisplayName("fromDomain으로 id가 null인 새 실행 이력을 변환한다")
    void fromDomain_newExecution_idIsNull() {
        BatchJobExecution execution = BatchJobExecution.start("new-job");

        BatchJobExecutionJpaEntity entity = BatchJobExecutionJpaEntity.fromDomain(execution);

        assertThat(entity.getId()).isNull();
    }
}
