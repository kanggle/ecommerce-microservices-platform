package com.example.batch.infrastructure.persistence;

import com.example.batch.domain.model.BatchJobExecution;
import com.example.batch.domain.repository.BatchJobExecutionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class BatchJobExecutionRepositoryImpl implements BatchJobExecutionRepository {

    private final JpaBatchJobExecutionRepository jpaRepository;
    private final BatchJobExecutionPersistenceMapper mapper;

    @Override
    public BatchJobExecution save(BatchJobExecution execution) {
        BatchJobExecutionJpaEntity entity = mapper.toEntity(execution);
        BatchJobExecutionJpaEntity saved = jpaRepository.save(entity);
        return mapper.toDomain(saved);
    }

    @Override
    public Optional<BatchJobExecution> findById(Long id) {
        return jpaRepository.findById(id).map(mapper::toDomain);
    }
}
