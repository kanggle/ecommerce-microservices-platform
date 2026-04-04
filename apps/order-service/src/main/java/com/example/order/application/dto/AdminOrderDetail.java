package com.example.order.application.dto;

import com.example.order.domain.model.Order;
import com.example.order.domain.model.ShippingAddress;

import java.time.Instant;
import java.util.List;

public record AdminOrderDetail(
        String orderId,
        String userId,
        String status,
        long totalPrice,
        List<OrderDetail.OrderItemDetail> items,
        OrderDetail.ShippingAddressDetail shippingAddress,
        Instant createdAt,
        Instant updatedAt
) {
    public static AdminOrderDetail from(Order order) {
        List<OrderDetail.OrderItemDetail> items = order.getItems().stream()
                .map(i -> new OrderDetail.OrderItemDetail(
                        i.getProductId(), i.getVariantId(),
                        i.getProductName(), i.getOptionName(),
                        i.getQuantity(), i.getUnitPrice()
                ))
                .toList();

        ShippingAddress addr = order.getShippingAddress();
        OrderDetail.ShippingAddressDetail addrDetail = new OrderDetail.ShippingAddressDetail(
                addr.getRecipient(), addr.getPhone(), addr.getZipCode(),
                addr.getAddress1(), addr.getAddress2()
        );

        return new AdminOrderDetail(
                order.getOrderId(),
                order.getUserId(),
                order.getStatus().name(),
                order.getTotalPrice(),
                items,
                addrDetail,
                order.getCreatedAt(),
                order.getUpdatedAt()
        );
    }
}
