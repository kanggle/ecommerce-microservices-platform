package com.example.order.infrastructure.persistence;

import com.example.order.domain.model.Order;
import com.example.order.domain.model.OrderStatus;
import com.example.order.domain.model.PageQuery;
import com.example.order.domain.model.PageResult;
import com.example.order.domain.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

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
        // version이 있는 기존 주문 ID를 수집하여 findAllById로 한 번에 조회 (N+1 방지)
        List<String> existingIds = orders.stream()
                .filter(o -> o.getVersion() != null)
                .map(Order::getOrderId)
                .toList();

        Map<String, OrderJpaEntity> existingMap = existingIds.isEmpty()
                ? Map.of()
                : jpaRepository.findAllById(existingIds).stream()
                        .collect(Collectors.toMap(OrderJpaEntity::getOrderId, e -> e));

        List<OrderJpaEntity> entities = new ArrayList<>(orders.size());
        for (Order order : orders) {
            if (order.getVersion() == null) {
                entities.add(mapper.toEntity(order));
            } else {
                OrderJpaEntity existing = existingMap.get(order.getOrderId());
                if (existing == null) {
                    throw new IllegalStateException(
                            "Order not found for update: " + order.getOrderId());
                }
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
    public PageResult<Order> findByUserId(String userId, PageQuery pageQuery) {
        PageRequest pageable = toPageRequest(pageQuery);
        Page<OrderJpaEntity> page = jpaRepository.findByUserId(userId, pageable);
        return toPageResult(page);
    }

    @Override
    public PageResult<Order> findByUserIdAndStatus(String userId, OrderStatus status, PageQuery pageQuery) {
        PageRequest pageable = toPageRequest(pageQuery);
        Page<OrderJpaEntity> page = jpaRepository.findByUserIdAndStatus(userId, status, pageable);
        return toPageResult(page);
    }

    @Override
    public List<Order> findByUserIdAndStatusIn(String userId, Collection<OrderStatus> statuses) {
        return jpaRepository.findByUserIdAndStatusIn(userId, statuses).stream()
                .map(mapper::toDomain)
                .toList();
    }

    private PageRequest toPageRequest(PageQuery pageQuery) {
        Sort.Direction direction = "ASC".equalsIgnoreCase(pageQuery.sortDirection())
                ? Sort.Direction.ASC
                : Sort.Direction.DESC;
        return PageRequest.of(pageQuery.page(), pageQuery.size(), Sort.by(direction, pageQuery.sortBy()));
    }

    private PageResult<Order> toPageResult(Page<OrderJpaEntity> page) {
        List<Order> content = page.getContent().stream()
                .map(mapper::toDomain)
                .toList();
        return new PageResult<>(content, page.getNumber(), page.getSize(), page.getTotalElements(), page.getTotalPages());
    }
}
