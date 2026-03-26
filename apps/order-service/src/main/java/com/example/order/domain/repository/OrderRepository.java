package com.example.order.domain.repository;

import com.example.order.domain.model.Order;
import com.example.order.domain.model.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface OrderRepository {

    Order save(Order order);

    Optional<Order> findById(String orderId);

    Page<Order> findByUserId(String userId, Pageable pageable);

    Page<Order> findByUserIdAndStatus(String userId, OrderStatus status, Pageable pageable);

    List<Order> findByUserIdAndStatusIn(String userId, Collection<OrderStatus> statuses);
}
