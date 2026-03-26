package com.example.order.application.service;

import com.example.order.application.dto.OrderDetail;
import com.example.order.application.dto.OrderSummary;
import com.example.order.domain.exception.OrderNotFoundException;
import com.example.order.domain.model.Order;
import com.example.order.domain.model.OrderStatus;
import com.example.order.domain.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class OrderQueryService {

    private final OrderRepository orderRepository;

    @Transactional(readOnly = true)
    public Page<OrderSummary> getOrders(String userId, OrderStatus status, Pageable pageable) {
        Page<Order> orders = (status != null)
                ? orderRepository.findByUserIdAndStatus(userId, status, pageable)
                : orderRepository.findByUserId(userId, pageable);
        return orders.map(OrderSummary::from);
    }

    @Transactional(readOnly = true)
    public OrderDetail getOrder(String orderId, String requestingUserId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new OrderNotFoundException(orderId));

        if (!order.getUserId().equals(requestingUserId)) {
            throw new UnauthorizedOrderAccessException();
        }

        return OrderDetail.from(order);
    }
}
