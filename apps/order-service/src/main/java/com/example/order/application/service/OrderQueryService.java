package com.example.order.application.service;

import com.example.order.application.dto.OrderDetail;
import com.example.order.application.dto.OrderSummary;
import com.example.order.application.exception.UnauthorizedOrderAccessException;
import com.example.order.domain.exception.OrderNotFoundException;
import com.example.order.domain.model.Order;
import com.example.order.domain.model.OrderStatus;
import com.example.order.domain.model.PageQuery;
import com.example.order.domain.model.PageResult;
import com.example.order.domain.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class OrderQueryService {

    private final OrderRepository orderRepository;

    @Transactional(readOnly = true)
    public PageResult<OrderSummary> getOrders(String userId, OrderStatus status, PageQuery pageQuery) {
        PageResult<Order> orders = (status != null)
                ? orderRepository.findByUserIdAndStatus(userId, status, pageQuery)
                : orderRepository.findByUserId(userId, pageQuery);
        return mapToSummaryPageResult(orders);
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

    private PageResult<OrderSummary> mapToSummaryPageResult(PageResult<Order> orders) {
        return new PageResult<>(
                orders.content().stream().map(OrderSummary::from).toList(),
                orders.page(),
                orders.size(),
                orders.totalElements(),
                orders.totalPages()
        );
    }
}
