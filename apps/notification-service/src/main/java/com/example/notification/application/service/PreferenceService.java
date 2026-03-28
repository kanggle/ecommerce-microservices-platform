package com.example.notification.application.service;

import com.example.notification.application.command.UpdatePreferenceCommand;
import com.example.notification.application.port.out.PreferenceRepository;
import com.example.notification.application.result.GetPreferenceResult;
import com.example.notification.domain.model.UserNotificationPreference;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PreferenceService {

    private final PreferenceRepository preferenceRepository;

    @Transactional
    public GetPreferenceResult getPreference(String userId) {
        UserNotificationPreference preference = preferenceRepository.findByUserId(userId)
                .orElseGet(() -> {
                    UserNotificationPreference defaultPref = UserNotificationPreference.createDefault(userId);
                    return preferenceRepository.save(defaultPref);
                });
        return GetPreferenceResult.from(preference);
    }

    @Transactional
    public GetPreferenceResult updatePreference(UpdatePreferenceCommand command) {
        UserNotificationPreference preference = preferenceRepository.findByUserId(command.userId())
                .orElseGet(() -> UserNotificationPreference.createDefault(command.userId()));

        preference.update(command.emailEnabled(), command.smsEnabled(), command.pushEnabled());
        UserNotificationPreference saved = preferenceRepository.save(preference);
        return GetPreferenceResult.from(saved);
    }
}
