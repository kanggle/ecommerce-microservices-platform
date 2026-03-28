package com.example.notification.adapter.in.rest;

import com.example.notification.application.service.NotificationQueryService;
import com.example.notification.application.service.PreferenceService;
import com.example.notification.domain.exception.NotificationNotFoundException;
import com.example.notification.domain.exception.UnauthorizedNotificationAccessException;
import com.example.notification.domain.model.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(NotificationController.class)
@DisplayName("NotificationController 슬라이스 테스트")
class NotificationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private NotificationQueryService notificationQueryService;

    @MockitoBean
    private PreferenceService preferenceService;

    @Test
    @DisplayName("GET /api/notifications/me - 알림 목록 조회 성공")
    void getMyNotifications_returns200() throws Exception {
        Notification notification = Notification.reconstitute(
                "noti-1", "user-1", NotificationChannel.EMAIL,
                "Test Subject", "Test Body", NotificationStatus.SENT,
                "event-1", 0, LocalDateTime.now(), LocalDateTime.now());

        given(notificationQueryService.getNotifications(eq("user-1"), any()))
                .willReturn(new PageImpl<>(List.of(notification), PageRequest.of(0, 20), 1));

        mockMvc.perform(get("/api/notifications/me")
                        .header("X-User-Id", "user-1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].notificationId").value("noti-1"))
                .andExpect(jsonPath("$.content[0].channel").value("EMAIL"))
                .andExpect(jsonPath("$.content[0].status").value("SENT"))
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    @Test
    @DisplayName("GET /api/notifications/me/{notificationId} - 알림 상세 조회 성공")
    void getNotificationDetail_returns200() throws Exception {
        Notification notification = Notification.reconstitute(
                "noti-1", "user-1", NotificationChannel.EMAIL,
                "Subject", "Body content", NotificationStatus.SENT,
                "event-1", 0, LocalDateTime.now(), LocalDateTime.now());

        given(notificationQueryService.getNotificationDetail("user-1", "noti-1"))
                .willReturn(notification);

        mockMvc.perform(get("/api/notifications/me/noti-1")
                        .header("X-User-Id", "user-1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.notificationId").value("noti-1"))
                .andExpect(jsonPath("$.body").value("Body content"));
    }

    @Test
    @DisplayName("GET /api/notifications/me/{notificationId} - 존재하지 않는 알림 조회 시 404")
    void getNotificationDetail_notFound_returns404() throws Exception {
        given(notificationQueryService.getNotificationDetail("user-1", "noti-999"))
                .willThrow(new NotificationNotFoundException("noti-999"));

        mockMvc.perform(get("/api/notifications/me/noti-999")
                        .header("X-User-Id", "user-1"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("NOTIFICATION_NOT_FOUND"));
    }

    @Test
    @DisplayName("GET /api/notifications/me/{notificationId} - 다른 사용자의 알림 조회 시 403")
    void getNotificationDetail_wrongUser_returns403() throws Exception {
        given(notificationQueryService.getNotificationDetail("user-1", "noti-1"))
                .willThrow(new UnauthorizedNotificationAccessException("Not the notification recipient"));

        mockMvc.perform(get("/api/notifications/me/noti-1")
                        .header("X-User-Id", "user-1"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("ACCESS_DENIED"));
    }

    @Test
    @DisplayName("GET /api/notifications/me/preferences - 알림 설정 조회 성공")
    void getPreferences_returns200() throws Exception {
        UserNotificationPreference pref = UserNotificationPreference.reconstitute(
                "user-1", true, false, true, LocalDateTime.now(), LocalDateTime.now());

        given(preferenceService.getPreference("user-1")).willReturn(pref);

        mockMvc.perform(get("/api/notifications/me/preferences")
                        .header("X-User-Id", "user-1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId").value("user-1"))
                .andExpect(jsonPath("$.emailEnabled").value(true))
                .andExpect(jsonPath("$.smsEnabled").value(false))
                .andExpect(jsonPath("$.pushEnabled").value(true));
    }

    @Test
    @DisplayName("PUT /api/notifications/me/preferences - 알림 설정 수정 성공")
    void updatePreferences_returns200() throws Exception {
        UserNotificationPreference updated = UserNotificationPreference.reconstitute(
                "user-1", false, true, false, LocalDateTime.now(), LocalDateTime.now());

        given(preferenceService.updatePreference(any())).willReturn(updated);

        mockMvc.perform(put("/api/notifications/me/preferences")
                        .header("X-User-Id", "user-1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"emailEnabled\":false,\"smsEnabled\":true,\"pushEnabled\":false}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.emailEnabled").value(false))
                .andExpect(jsonPath("$.smsEnabled").value(true))
                .andExpect(jsonPath("$.pushEnabled").value(false));
    }

    @Test
    @DisplayName("PUT /api/notifications/me/preferences - 필수 필드 누락 시 400")
    void updatePreferences_missingField_returns400() throws Exception {
        mockMvc.perform(put("/api/notifications/me/preferences")
                        .header("X-User-Id", "user-1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"emailEnabled\":true}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
    }
}
