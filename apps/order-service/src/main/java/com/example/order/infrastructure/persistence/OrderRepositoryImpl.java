package com.example.order.infrastructure.persistence;

import com.example.order.domain.model.Order;
import com.example.order.domain.model.OrderStatus;
import com.example.order.domain.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class OrderRepositoryImpl implements OrderRepository {

    private final OrderJpaRepository jpaRepository;
    private final OrderJpaMapper mapper;

    @Override
    public Order save(Order order) {
        if (order.getVersion() == null) {
            OrderJpaEntity entity = mapper.toEntity(order);
            OrderJpaEntity saved = jpaRepository.save(entity);
            return mapper.toDomain(saved);
        }

        OrderJpaEntity existing = jpaRepository.findById(order.getOrderId())
                .orElseThrow(() -> new IllegalStateException(
                        "Order not found for update: " + order.getOrderId()));
        existing.updateFrom(order);
        return mapper.toDomain(existing);
    }

    @Override
    public List<Order> saveAll(List<Order> orders) {
        // save()와 동일한 version 기반 신규/수정 분기 처리
        List<OrderJpaEntity> entities = new java.util.ArrayList<>(orders.size());
        for (Order order : orders) {
            if (order.getVersion() == null) {
                entities.add(mapper.toEntity(order));
            } else {
                OrderJpaEntity existing = jpaRepository.findById(order.getOrderId())
                        .orElseThrow(() -> new IllegalStateException(
                                "Order not found for update: " + order.getOrderId()));
                existing.updateFrom(order);
                entities.add(existing);
            }
        }
        List<OrderJpaEntity> savedEntities = jpaRepository.saveAll(entities);
        return savedEntities.stream()
                .map(mapper::toDomain)
                .toList();
    }

    @Override
    public Optional<Order> findById(String orderId) {
        return jpaRepository.findById(orderId).map(mapper::toDomain);
    }

    @Override
    public Page<Order> findByUserId(String userId, Pageable pageable) {
        return jpaRepository.findByUserId(userId, pageable).map(mapper::toDomain);
    }

    @Override
    public Page<Order> findByUserIdAndStatus(String userId, OrderStatus status, Pageable pageable) {
        return jpaRepository.findByUserIdAndStatus(userId, status, pageable).map(mapper::toDomain);
    }

    @Override
    public List<Order> findByUserIdAndStatusIn(String userId, Collection<OrderStatus> statuses) {
        return jpaRepository.findByUserIdAndStatusIn(userId, statuses).stream()
                .map(mapper::toDomain)
                .toList();
    }
}
