package com.example.order.presentation.dto;

import com.example.order.application.dto.AdminOrderDetail;
import com.example.order.application.dto.OrderDetail;

import java.time.Instant;
import java.util.List;

public record AdminOrderDetailResponse(
        String orderId,
        String userId,
        String status,
        long totalPrice,
        List<ItemDetail> items,
        ShippingAddressDetail shippingAddress,
        Instant createdAt,
        Instant updatedAt
) {
    public static AdminOrderDetailResponse from(AdminOrderDetail detail) {
        List<ItemDetail> items = detail.items().stream()
                .map(i -> new ItemDetail(
                        i.productId(), i.variantId(), i.productName(),
                        i.optionName(), i.quantity(), i.unitPrice()
                ))
                .toList();

        OrderDetail.ShippingAddressDetail addr = detail.shippingAddress();
        ShippingAddressDetail addrItem = new ShippingAddressDetail(
                addr.recipient(), addr.phone(), addr.zipCode(), addr.address1(), addr.address2()
        );

        return new AdminOrderDetailResponse(
                detail.orderId(), detail.userId(), detail.status(), detail.totalPrice(),
                items, addrItem, detail.createdAt(), detail.updatedAt()
        );
    }

    public record ItemDetail(
            String productId, String variantId, String productName,
            String optionName, int quantity, long unitPrice
    ) {}

    public record ShippingAddressDetail(
            String recipient, String phone, String zipCode,
            String address1, String address2
    ) {}
}
