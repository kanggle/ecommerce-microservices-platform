package com.example.order.application.service;

import com.example.order.application.dto.AdminOrderDetail;
import com.example.order.application.dto.AdminOrderSummary;
import com.example.order.application.dto.OrderDetail;
import com.example.order.application.dto.OrderSummary;
import com.example.order.application.exception.UnauthorizedOrderAccessException;
import com.example.order.domain.exception.OrderNotFoundException;
import com.example.order.domain.model.Order;
import com.example.order.domain.model.OrderStatus;
import com.example.common.page.PageQuery;
import com.example.common.page.PageResult;
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

    @Transactional(readOnly = true)
    public PageResult<AdminOrderSummary> getAllOrders(OrderStatus status, PageQuery pageQuery) {
        PageResult<Order> orders = (status != null)
                ? orderRepository.findByStatusWithItems(status, pageQuery)
                : orderRepository.findAllWithItems(pageQuery);
        return new PageResult<>(
                orders.content().stream().map(AdminOrderSummary::from).toList(),
                orders.page(), orders.size(), orders.totalElements(), orders.totalPages()
        );
    }

    @Transactional(readOnly = true)
    public AdminOrderDetail getOrderForAdmin(String orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new OrderNotFoundException(orderId));
        return AdminOrderDetail.from(order);
    }

    @Transactional(readOnly = true)
    public boolean hasUserPurchasedProduct(String userId, String productId) {
        return orderRepository.existsByUserIdAndProductIdAndStatus(userId, productId, OrderStatus.DELIVERED);
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
