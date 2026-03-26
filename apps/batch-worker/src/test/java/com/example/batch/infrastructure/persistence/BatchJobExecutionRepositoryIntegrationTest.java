package com.example.batch.infrastructure.persistence;

import com.example.batch.domain.model.BatchJobExecution;
import com.example.batch.domain.model.BatchJobStatus;
import com.example.batch.domain.repository.BatchJobExecutionRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.KafkaContainer;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.utility.DockerImageName;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Testcontainers
@DisplayName("BatchJobExecutionRepository 통합 테스트")
class BatchJobExecutionRepositoryIntegrationTest {

    @SuppressWarnings("resource")
    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine")
            .withDatabaseName("batch_db")
            .withUsername("batch_user")
            .withPassword("batch_pass");

    @Container
    static KafkaContainer kafka = new KafkaContainer(
            DockerImageName.parse("confluentinc/cp-kafka:7.6.0"));

    @DynamicPropertySource
    static void overrideProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        registry.add("spring.kafka.bootstrap-servers", kafka::getBootstrapServers);
    }

    @Autowired
    private BatchJobExecutionRepository repository;

    @Test
    @DisplayName("RUNNING 상태의 실행 이력을 저장하고 조회한다")
    void save_runningExecution_persistsAndReturnsWithId() {
        BatchJobExecution execution = BatchJobExecution.start("session-cleanup-job");

        BatchJobExecution saved = repository.save(execution);

        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getJobName()).isEqualTo("session-cleanup-job");
        assertThat(saved.getStatus()).isEqualTo(BatchJobStatus.RUNNING);
        assertThat(saved.getStartedAt()).isNotNull();
        assertThat(saved.getFinishedAt()).isNull();
        assertThat(saved.getErrorMessage()).isNull();
    }

    @Test
    @DisplayName("저장된 실행 이력을 ID로 조회한다")
    void findById_existingId_returnsExecution() {
        BatchJobExecution execution = BatchJobExecution.start("order-cancel-job");
        BatchJobExecution saved = repository.save(execution);

        Optional<BatchJobExecution> found = repository.findById(saved.getId());

        assertThat(found).isPresent();
        assertThat(found.get().getId()).isEqualTo(saved.getId());
        assertThat(found.get().getJobName()).isEqualTo("order-cancel-job");
        assertThat(found.get().getStatus()).isEqualTo(BatchJobStatus.RUNNING);
    }

    @Test
    @DisplayName("존재하지 않는 ID로 조회 시 빈 Optional을 반환한다")
    void findById_nonExistingId_returnsEmpty() {
        Optional<BatchJobExecution> result = repository.findById(999999L);

        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("COMPLETED 상태의 실행 이력을 저장하고 조회한다")
    void save_completedExecution_persistsAllFields() {
        BatchJobExecution execution = BatchJobExecution.start("sales-aggregation-job");
        execution.complete();

        BatchJobExecution saved = repository.save(execution);
        Optional<BatchJobExecution> found = repository.findById(saved.getId());

        assertThat(found).isPresent();
        assertThat(found.get().getStatus()).isEqualTo(BatchJobStatus.COMPLETED);
        assertThat(found.get().getFinishedAt()).isNotNull();
        assertThat(found.get().getErrorMessage()).isNull();
    }

    @Test
    @DisplayName("FAILED 상태의 실행 이력을 저장하면 에러 메시지가 보존된다")
    void save_failedExecution_persistsErrorMessage() {
        BatchJobExecution execution = BatchJobExecution.start("index-sync-job");
        execution.fail("Elasticsearch cluster unavailable");

        BatchJobExecution saved = repository.save(execution);
        Optional<BatchJobExecution> found = repository.findById(saved.getId());

        assertThat(found).isPresent();
        assertThat(found.get().getStatus()).isEqualTo(BatchJobStatus.FAILED);
        assertThat(found.get().getFinishedAt()).isNotNull();
        assertThat(found.get().getErrorMessage()).isEqualTo("Elasticsearch cluster unavailable");
    }

    @Test
    @DisplayName("여러 실행 이력을 저장하면 각각 고유한 ID가 할당된다")
    void save_multipleExecutions_assignsUniqueIds() {
        BatchJobExecution exec1 = repository.save(BatchJobExecution.start("job-a"));
        BatchJobExecution exec2 = repository.save(BatchJobExecution.start("job-b"));
        BatchJobExecution exec3 = repository.save(BatchJobExecution.start("job-c"));

        assertThat(exec1.getId()).isNotEqualTo(exec2.getId());
        assertThat(exec2.getId()).isNotEqualTo(exec3.getId());
        assertThat(exec1.getId()).isNotEqualTo(exec3.getId());
    }

    @Test
    @DisplayName("동일 잡 이름으로 여러 실행 이력을 저장할 수 있다")
    void save_sameJobNameMultipleTimes_allowsDuplicateJobNames() {
        BatchJobExecution exec1 = repository.save(BatchJobExecution.start("cleanup-job"));
        BatchJobExecution exec2 = repository.save(BatchJobExecution.start("cleanup-job"));

        assertThat(exec1.getId()).isNotEqualTo(exec2.getId());
        assertThat(exec1.getJobName()).isEqualTo(exec2.getJobName());
    }
}
