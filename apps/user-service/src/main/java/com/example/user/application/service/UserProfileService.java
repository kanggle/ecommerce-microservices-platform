package com.example.user.application.service;

import com.example.user.application.command.UpdateProfileCommand;
import com.example.user.application.event.UserProfileUpdatedSpringEvent;
import com.example.user.application.event.UserWithdrawnSpringEvent;
import com.example.user.application.result.UserProfileResult;
import com.example.user.application.result.UserProfileSummaryResult;
import com.example.user.domain.exception.UserProfileNotFoundException;
import com.example.user.domain.model.PageQuery;
import com.example.user.domain.model.PageResult;
import com.example.user.domain.model.ProfileStatus;
import com.example.user.domain.model.UserProfile;
import com.example.user.domain.repository.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Objects;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserProfileService {

    private final UserProfileRepository userProfileRepository;
    private final ApplicationEventPublisher applicationEventPublisher;

    public UserProfileResult getProfile(UUID userId) {
        UserProfile profile = userProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new UserProfileNotFoundException(userId));
        return UserProfileResult.from(profile);
    }

    @Transactional
    public UserProfileResult updateProfile(UpdateProfileCommand command) {
        UserProfile profile = userProfileRepository.findByUserId(command.userId())
                .orElseThrow(() -> new UserProfileNotFoundException(command.userId()));

        boolean changed = hasChanges(profile, command);

        if (command.nickname() != null) {
            profile.updateNickname(command.nickname().trim());
        }
        if (command.phone() != null) {
            profile.updatePhone(command.phone().trim());
        }
        if (command.profileImageUrl() != null) {
            profile.updateProfileImageUrl(command.profileImageUrl().trim());
        }

        UserProfile saved = userProfileRepository.save(profile);

        if (changed) {
            applicationEventPublisher.publishEvent(new UserProfileUpdatedSpringEvent(
                    saved.getUserId(),
                    saved.getNickname(),
                    saved.getPhone(),
                    saved.getProfileImageUrl(),
                    saved.getUpdatedAt()
            ));
        }

        return UserProfileResult.from(saved);
    }

    private boolean hasChanges(UserProfile profile, UpdateProfileCommand command) {
        if (command.nickname() != null && !Objects.equals(profile.getNickname(), command.nickname().trim())) {
            return true;
        }
        if (command.phone() != null && !Objects.equals(profile.getPhone(), command.phone().trim())) {
            return true;
        }
        if (command.profileImageUrl() != null && !Objects.equals(profile.getProfileImageUrl(), command.profileImageUrl().trim())) {
            return true;
        }
        return false;
    }

    public PageResult<UserProfileSummaryResult> listUsers(ProfileStatus status, String email, int page, int size) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.max(Math.min(size, 100), 1);
        PageQuery pageQuery = new PageQuery(safePage, safeSize, "createdAt", "DESC");

        PageResult<UserProfile> profiles;

        if (status != null && email != null && !email.isBlank()) {
            profiles = userProfileRepository.findByStatusAndEmailContaining(status, email, pageQuery);
        } else if (status != null) {
            profiles = userProfileRepository.findByStatus(status, pageQuery);
        } else if (email != null && !email.isBlank()) {
            profiles = userProfileRepository.findByEmailContaining(email, pageQuery);
        } else {
            profiles = userProfileRepository.findAll(pageQuery);
        }

        java.util.List<UserProfileSummaryResult> content = profiles.content().stream()
                .map(UserProfileSummaryResult::from)
                .toList();
        return new PageResult<>(content, profiles.totalElements(), profiles.totalPages(), profiles.pageNumber(), profiles.pageSize());
    }

    public UserProfileResult getUserById(UUID userId) {
        return getProfile(userId);
    }

    @Transactional
    public void withdrawProfile(UUID userId) {
        UserProfile profile = userProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new UserProfileNotFoundException(userId));

        profile.withdraw();
        userProfileRepository.save(profile);

        applicationEventPublisher.publishEvent(new UserWithdrawnSpringEvent(
                profile.getUserId(),
                profile.getUpdatedAt()
        ));
    }
}
