package com.example.user.domain.model;

import lombok.Getter;

import java.time.Instant;
import java.util.UUID;

@Getter
public class UserProfile {

    private UUID id;
    private UUID userId;
    private Email email;
    private String name;
    private String nickname;
    private String phone;
    private String profileImageUrl;
    private ProfileStatus status;
    private Instant createdAt;
    private Instant updatedAt;

    private UserProfile() {
    }

    public static UserProfile create(UUID userId, String email, String name) {
        validateUserId(userId);
        Email validatedEmail = Email.of(email);

        UserProfile profile = new UserProfile();
        profile.id = UUID.randomUUID();
        profile.userId = userId;
        profile.email = validatedEmail;
        profile.name = (name == null || name.isBlank()) ? "" : name.trim();
        profile.status = ProfileStatus.ACTIVE;
        Instant now = Instant.now();
        profile.createdAt = now;
        profile.updatedAt = now;
        return profile;
    }

    public static UserProfile reconstitute(UUID id, UUID userId, String email, String name,
                                            String nickname, String phone, String profileImageUrl,
                                            ProfileStatus status, Instant createdAt, Instant updatedAt) {
        UserProfile profile = new UserProfile();
        profile.id = id;
        profile.userId = userId;
        profile.email = new Email(email);
        profile.name = name;
        profile.nickname = nickname;
        profile.phone = phone;
        profile.profileImageUrl = profileImageUrl;
        profile.status = status;
        profile.createdAt = createdAt;
        profile.updatedAt = updatedAt;
        return profile;
    }

    public void updateNickname(String nickname) {
        if (nickname != null && nickname.trim().length() > 50) {
            throw new IllegalArgumentException("Nickname must not exceed 50 characters");
        }
        this.nickname = nickname == null ? null : nickname.trim();
        this.updatedAt = Instant.now();
    }

    public void updatePhone(String phone) {
        if (phone != null && phone.trim().length() > 20) {
            throw new IllegalArgumentException("Phone must not exceed 20 characters");
        }
        this.phone = phone == null ? null : phone.trim();
        this.updatedAt = Instant.now();
    }

    public void updateProfileImageUrl(String profileImageUrl) {
        if (profileImageUrl != null && profileImageUrl.trim().length() > 500) {
            throw new IllegalArgumentException("Profile image URL must not exceed 500 characters");
        }
        this.profileImageUrl = profileImageUrl == null ? null : profileImageUrl.trim();
        this.updatedAt = Instant.now();
    }

    public void withdraw() {
        this.status = ProfileStatus.WITHDRAWN;
        this.updatedAt = Instant.now();
    }

    private static void validateUserId(UUID userId) {
        if (userId == null) {
            throw new IllegalArgumentException("User ID must not be null");
        }
    }
}
