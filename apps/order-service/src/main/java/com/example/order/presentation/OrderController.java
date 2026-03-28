package com.example.order.presentation;

import com.example.order.application.dto.CancelOrderResult;
import com.example.order.application.dto.OrderDetail;
import com.example.order.application.dto.OrderSummary;
import com.example.order.application.dto.PlaceOrderCommand;
import com.example.order.application.dto.PlaceOrderResult;
import com.example.order.application.service.OrderCancellationService;
import com.example.order.application.service.OrderPlacementService;
import com.example.order.application.service.OrderQueryService;
import com.example.order.domain.model.OrderStatus;
import com.example.order.domain.model.PageQuery;
import com.example.order.domain.model.PageResult;
import com.example.order.presentation.exception.InvalidOrderStatusException;
import com.example.order.presentation.dto.CancelOrderResponse;
import com.example.order.presentation.dto.OrderDetailResponse;
import com.example.order.presentation.dto.OrderListResponse;
import com.example.order.presentation.dto.PlaceOrderRequest;
import com.example.order.presentation.dto.PlaceOrderResponse;
import com.example.order.presentation.dto.VerifyPurchaseResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Validated
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/orders")
public class OrderController {

    private static final int MAX_PAGE_SIZE = 100;
    private static final int DEFAULT_PAGE_SIZE = 20;

    private final OrderPlacementService orderPlacementService;
    private final OrderQueryService orderQueryService;
    private final OrderCancellationService orderCancellationService;

    @PostMapping
    public ResponseEntity<PlaceOrderResponse> placeOrder(
            @RequestHeader("X-User-Id") @NotBlank(message = "X-User-Id 헤더는 필수입니다") String userId,
            @Valid @RequestBody PlaceOrderRequest request
    ) {
        List<PlaceOrderCommand.OrderItemCommand> itemCommands = request.items().stream()
                .map(i -> new PlaceOrderCommand.OrderItemCommand(
                        i.productId(), i.variantId(), i.productName(), i.optionName(),
                        i.quantity(), i.unitPrice()
                ))
                .toList();

        PlaceOrderRequest.ShippingAddressRequest addr = request.shippingAddress();
        PlaceOrderCommand.ShippingAddressCommand addrCommand = new PlaceOrderCommand.ShippingAddressCommand(
                addr.recipient(), addr.phone(), addr.zipCode(), addr.address1(), addr.address2()
        );

        PlaceOrderCommand command = new PlaceOrderCommand(userId, itemCommands, addrCommand);
        PlaceOrderResult result = orderPlacementService.placeOrder(command);
        return ResponseEntity.status(HttpStatus.CREATED).body(PlaceOrderResponse.from(result));
    }

    @GetMapping
    public ResponseEntity<OrderListResponse> getOrders(
            @RequestHeader("X-User-Id") @NotBlank(message = "X-User-Id 헤더는 필수입니다") String userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String status
    ) {
        int safePage = Math.max(page, 0);
        int safeSize = size < 1 ? DEFAULT_PAGE_SIZE : Math.min(size, MAX_PAGE_SIZE);
        OrderStatus orderStatus = parseStatus(status);
        PageQuery pageQuery = new PageQuery(safePage, safeSize, "createdAt", "DESC");
        PageResult<OrderSummary> result = orderQueryService.getOrders(userId, orderStatus, pageQuery);
        return ResponseEntity.ok(OrderListResponse.from(result));
    }

    private OrderStatus parseStatus(String status) {
        if (status == null || status.isBlank()) {
            return null;
        }
        try {
            return OrderStatus.valueOf(status);
        } catch (IllegalArgumentException e) {
            throw new InvalidOrderStatusException(status);
        }
    }

    @GetMapping("/verify-purchase")
    public ResponseEntity<VerifyPurchaseResponse> verifyPurchase(
            @RequestHeader("X-User-Id") @NotBlank(message = "X-User-Id 헤더는 필수입니다") String userId,
            @RequestParam @NotNull(message = "productId는 필수입니다") String productId
    ) {
        boolean purchased = orderQueryService.hasUserPurchasedProduct(userId, productId);
        return ResponseEntity.ok(new VerifyPurchaseResponse(purchased));
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<OrderDetailResponse> getOrder(
            @RequestHeader("X-User-Id") @NotBlank(message = "X-User-Id 헤더는 필수입니다") String userId,
            @PathVariable String orderId
    ) {
        OrderDetail detail = orderQueryService.getOrder(orderId, userId);
        return ResponseEntity.ok(OrderDetailResponse.from(detail));
    }

    @PostMapping("/{orderId}/cancel")
    public ResponseEntity<CancelOrderResponse> cancelOrder(
            @RequestHeader("X-User-Id") @NotBlank(message = "X-User-Id 헤더는 필수입니다") String userId,
            @PathVariable String orderId
    ) {
        CancelOrderResult result = orderCancellationService.cancelOrder(orderId, userId);
        return ResponseEntity.ok(CancelOrderResponse.from(result));
    }
}
