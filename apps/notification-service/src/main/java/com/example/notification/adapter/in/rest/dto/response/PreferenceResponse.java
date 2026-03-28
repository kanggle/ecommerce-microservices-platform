package com.example.notification.adapter.in.rest.dto.response;

import com.example.notification.domain.model.UserNotificationPreference;

public record PreferenceResponse(
        String userId,
        boolean emailEnabled,
        boolean smsEnabled,
        boolean pushEnabled
) {
    public static PreferenceResponse from(UserNotificationPreference pref) {
        return new PreferenceResponse(
                pref.getUserId(),
                pref.isEmailEnabled(),
                pref.isSmsEnabled(),
                pref.isPushEnabled()
        );
    }
}
