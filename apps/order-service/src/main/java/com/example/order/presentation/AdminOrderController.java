package com.example.order.presentation;

import com.example.order.application.dto.AdminOrderDetail;
import com.example.order.application.dto.AdminOrderSummary;
import com.example.order.application.service.AdminOrderStatusService;
import com.example.order.application.service.OrderQueryService;
import com.example.order.domain.model.Order;
import com.example.order.domain.model.OrderStatus;
import com.example.common.page.PageQuery;
import com.example.common.page.PageResult;
import com.example.order.presentation.dto.AdminOrderDetailResponse;
import com.example.order.presentation.dto.AdminOrderListResponse;
import com.example.order.presentation.dto.AdminOrderStatusChangeRequest;
import com.example.order.presentation.dto.AdminOrderStatusChangeResponse;
import com.example.order.presentation.exception.InvalidOrderStatusException;
import com.example.web.exception.AccessDeniedException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/orders")
public class AdminOrderController {

    private static final String ROLE_ADMIN = "ADMIN";
    private static final int MAX_PAGE_SIZE = 100;
    private static final int DEFAULT_PAGE_SIZE = 20;

    private final OrderQueryService orderQueryService;
    private final AdminOrderStatusService adminOrderStatusService;

    @GetMapping
    public ResponseEntity<AdminOrderListResponse> getOrders(
            @RequestHeader(value = "X-User-Role", required = false) String userRole,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String status
    ) {
        validateAdminRole(userRole);
        int safePage = Math.max(page, 0);
        int safeSize = size < 1 ? DEFAULT_PAGE_SIZE : Math.min(size, MAX_PAGE_SIZE);
        OrderStatus orderStatus = parseStatus(status);
        PageQuery pageQuery = new PageQuery(safePage, safeSize, "createdAt", "DESC");
        PageResult<AdminOrderSummary> result = orderQueryService.getAllOrders(orderStatus, pageQuery);
        return ResponseEntity.ok(AdminOrderListResponse.from(result));
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<AdminOrderDetailResponse> getOrder(
            @RequestHeader(value = "X-User-Role", required = false) String userRole,
            @PathVariable String orderId
    ) {
        validateAdminRole(userRole);
        AdminOrderDetail detail = orderQueryService.getOrderForAdmin(orderId);
        return ResponseEntity.ok(AdminOrderDetailResponse.from(detail));
    }

    @PostMapping("/{orderId}/status")
    public ResponseEntity<AdminOrderStatusChangeResponse> changeStatus(
            @RequestHeader(value = "X-User-Role", required = false) String userRole,
            @PathVariable String orderId,
            @Valid @RequestBody AdminOrderStatusChangeRequest request
    ) {
        validateAdminRole(userRole);
        OrderStatus targetStatus = parseStatus(request.status());
        if (targetStatus == null) {
            throw new InvalidOrderStatusException(request.status());
        }
        Order order = adminOrderStatusService.changeStatus(orderId, targetStatus);
        return ResponseEntity.ok(new AdminOrderStatusChangeResponse(order.getOrderId(), order.getStatus().name()));
    }

    private void validateAdminRole(String userRole) {
        if (!ROLE_ADMIN.equalsIgnoreCase(userRole)) {
            throw new AccessDeniedException();
        }
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
}
