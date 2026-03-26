package com.example.order.domain.repository;

import com.example.order.domain.model.Order;
import com.example.order.domain.model.OrderStatus;
import com.example.order.domain.model.PageQuery;
import com.example.order.domain.model.PageResult;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface OrderRepository {

    Order save(Order order);

    List<Order> saveAll(List<Order> orders);

    Optional<Order> findById(String orderId);

    PageResult<Order> findByUserId(String userId, PageQuery pageQuery);

    PageResult<Order> findByUserIdAndStatus(String userId, OrderStatus status, PageQuery pageQuery);

    List<Order> findByUserIdAndStatusIn(String userId, Collection<OrderStatus> statuses);
}
