package com.example.order.application.service;

import com.example.order.application.event.OrderCancelledEvent;
import com.example.order.application.port.OrderEventPublisher;
import com.example.order.application.port.OrderMetricsPort;
import com.example.order.domain.model.Order;
import com.example.order.domain.model.OrderStatus;
import com.example.order.domain.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserWithdrawalOrderService {

    private static final List<OrderStatus> ACTIVE_STATUSES = List.of(OrderStatus.PENDING, OrderStatus.CONFIRMED);

    private final OrderRepository orderRepository;
    private final OrderEventPublisher orderEventPublisher;
    private final OrderMetricsPort orderMetrics;
    private final Clock clock;

    @Transactional
    public void cancelOrdersForWithdrawnUser(String userId) {
        List<Order> activeOrders = orderRepository.findByUserIdAndStatusIn(userId, ACTIVE_STATUSES);

        if (activeOrders.isEmpty()) {
            log.info("No active orders for withdrawn user: userId={}", userId);
            return;
        }

        List<String> previousStatuses = new ArrayList<>(activeOrders.size());
        for (Order order : activeOrders) {
            previousStatuses.add(order.getStatus().name());
            order.cancel(clock);
        }

        orderRepository.saveAll(activeOrders);

        for (int i = 0; i < activeOrders.size(); i++) {
            Order order = activeOrders.get(i);
            orderMetrics.recordOrderCancelled("user_withdrawn");
            orderMetrics.recordStatusTransition(previousStatuses.get(i), order.getStatus().name());

            orderEventPublisher.publishOrderCancelled(
                    OrderCancelledEvent.of(order.getOrderId(), order.getUserId(),
                            order.getUpdatedAt(), clock));
        }

        log.info("Cancelled active orders for withdrawn user: userId={}, cancelledCount={}", userId, activeOrders.size());
    }
}
