package com.example.notification.adapter.in.rest;

import com.example.notification.adapter.in.rest.dto.request.UpdatePreferenceRequest;
import com.example.notification.adapter.in.rest.dto.response.NotificationDetailResponse;
import com.example.notification.adapter.in.rest.dto.response.NotificationListResponse;
import com.example.notification.adapter.in.rest.dto.response.PreferenceResponse;
import com.example.notification.application.command.UpdatePreferenceCommand;
import com.example.notification.application.page.PageQuery;
import com.example.notification.application.page.PageResult;
import com.example.notification.application.service.NotificationQueryService;
import com.example.notification.application.service.PreferenceService;
import com.example.notification.domain.model.Notification;
import com.example.notification.domain.model.UserNotificationPreference;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationQueryService notificationQueryService;
    private final PreferenceService preferenceService;

    @GetMapping("/me")
    public ResponseEntity<NotificationListResponse> getMyNotifications(
            @RequestHeader("X-User-Id") String userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        PageResult<Notification> notifications = notificationQueryService.getNotifications(
                userId, PageQuery.of(page, size));
        return ResponseEntity.ok(NotificationListResponse.from(notifications));
    }

    @GetMapping("/me/{notificationId}")
    public ResponseEntity<NotificationDetailResponse> getNotificationDetail(
            @RequestHeader("X-User-Id") String userId,
            @PathVariable String notificationId
    ) {
        Notification notification = notificationQueryService.getNotificationDetail(userId, notificationId);
        return ResponseEntity.ok(NotificationDetailResponse.from(notification));
    }

    @GetMapping("/me/preferences")
    public ResponseEntity<PreferenceResponse> getPreferences(
            @RequestHeader("X-User-Id") String userId
    ) {
        UserNotificationPreference preference = preferenceService.getPreference(userId);
        return ResponseEntity.ok(PreferenceResponse.from(preference));
    }

    @PutMapping("/me/preferences")
    public ResponseEntity<PreferenceResponse> updatePreferences(
            @RequestHeader("X-User-Id") String userId,
            @Valid @RequestBody UpdatePreferenceRequest request
    ) {
        UpdatePreferenceCommand command = new UpdatePreferenceCommand(
                userId, request.emailEnabled(), request.smsEnabled(), request.pushEnabled());
        UserNotificationPreference preference = preferenceService.updatePreference(command);
        return ResponseEntity.ok(PreferenceResponse.from(preference));
    }
}
