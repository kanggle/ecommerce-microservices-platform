package com.example.notification.application.port.in;

import com.example.notification.application.command.UpdatePreferenceCommand;
import com.example.notification.application.result.GetPreferenceResult;

public interface ManagePreferenceUseCase {
    GetPreferenceResult getPreference(String userId);
    GetPreferenceResult updatePreference(UpdatePreferenceCommand command);
}
