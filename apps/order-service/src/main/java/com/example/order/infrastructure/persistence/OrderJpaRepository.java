package com.example.order.infrastructure.persistence;

import com.example.order.domain.model.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;

interface OrderJpaRepository extends JpaRepository<OrderJpaEntity, String> {

    Page<OrderJpaEntity> findByUserId(String userId, Pageable pageable);

    Page<OrderJpaEntity> findByUserIdAndStatus(String userId, OrderStatus status, Pageable pageable);

    List<OrderJpaEntity> findByUserIdAndStatusIn(String userId, Collection<OrderStatus> statuses);
}
