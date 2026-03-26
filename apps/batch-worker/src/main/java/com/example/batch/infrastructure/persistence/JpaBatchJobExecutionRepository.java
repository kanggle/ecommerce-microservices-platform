package com.example.batch.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

interface JpaBatchJobExecutionRepository extends JpaRepository<BatchJobExecutionJpaEntity, Long> {
}
