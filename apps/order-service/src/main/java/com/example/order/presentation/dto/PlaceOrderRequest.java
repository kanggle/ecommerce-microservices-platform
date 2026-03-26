package com.example.order.presentation.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.util.List;

public record PlaceOrderRequest(
        @NotEmpty(message = "주문 항목은 필수입니다")
        @Valid
        List<OrderItemRequest> items,

        @NotNull(message = "배송지 정보는 필수입니다")
        @Valid
        ShippingAddressRequest shippingAddress
) {
    public record OrderItemRequest(
            @NotNull(message = "productId는 필수입니다")
            String productId,

            @NotNull(message = "variantId는 필수입니다")
            String variantId,

            @NotNull(message = "productName은 필수입니다")
            String productName,

            String optionName,

            @Positive(message = "quantity는 1 이상이어야 합니다")
            int quantity,

            @Positive(message = "unitPrice는 1 이상이어야 합니다")
            long unitPrice
    ) {}

    public record ShippingAddressRequest(
            @NotNull(message = "수령인은 필수입니다")
            String recipient,

            @NotNull(message = "전화번호는 필수입니다")
            String phone,

            @NotNull(message = "우편번호는 필수입니다")
            String zipCode,

            @NotNull(message = "주소1은 필수입니다")
            String address1,

            String address2
    ) {}
}
