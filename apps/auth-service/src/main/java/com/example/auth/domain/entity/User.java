package com.example.auth.domain.entity;

import lombok.Getter;

import java.time.Instant;
import java.util.UUID;

@Getter
public class User {

    private UUID id;
    private Email email;
    private String passwordHash;
    private String name;
    private Instant createdAt;
    private Instant updatedAt;
    private boolean active = true;

    private User() {
    }

    public static User create(String email, String encodedPassword, String name) {
        Email validatedEmail = Email.of(email);
        validateName(name);

        User user = new User();
        user.id = UUID.randomUUID();
        user.email = validatedEmail;
        user.passwordHash = encodedPassword;
        user.name = name.trim();
        Instant now = Instant.now();
        user.createdAt = now;
        user.updatedAt = now;
        user.active = true;
        return user;
    }

    public static User reconstitute(UUID id, String email, String passwordHash, String name,
                                     Instant createdAt, Instant updatedAt, boolean active) {
        User user = new User();
        user.id = id;
        user.email = new Email(email);
        user.passwordHash = passwordHash;
        user.name = name;
        user.createdAt = createdAt;
        user.updatedAt = updatedAt;
        user.active = active;
        return user;
    }

    public void updateName(String name) {
        validateName(name);
        this.name = name.trim();
        this.updatedAt = Instant.now();
    }

    public void deactivate() {
        this.active = false;
        this.updatedAt = Instant.now();
    }

    private static void validateName(String name) {
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Name must not be blank");
        }
        if (name.trim().length() > 50) {
            throw new IllegalArgumentException("Name must not exceed 50 characters");
        }
    }
}
