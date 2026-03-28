package com.example.notification.application.service;

import com.example.notification.application.command.UpdatePreferenceCommand;
import com.example.notification.application.port.out.PreferenceRepository;
import com.example.notification.domain.model.UserNotificationPreference;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PreferenceService {

    private final PreferenceRepository preferenceRepository;

    public UserNotificationPreference getPreference(String userId) {
        return preferenceRepository.findByUserId(userId)
                .orElseGet(() -> {
                    UserNotificationPreference defaultPref = UserNotificationPreference.createDefault(userId);
                    return preferenceRepository.save(defaultPref);
                });
    }

    @Transactional
    public UserNotificationPreference updatePreference(UpdatePreferenceCommand command) {
        UserNotificationPreference preference = preferenceRepository.findByUserId(command.userId())
                .orElseGet(() -> UserNotificationPreference.createDefault(command.userId()));

        preference.update(command.emailEnabled(), command.smsEnabled(), command.pushEnabled());
        return preferenceRepository.save(preference);
    }
}
