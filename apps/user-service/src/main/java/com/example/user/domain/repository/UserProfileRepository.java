package com.example.user.domain.repository;

import com.example.user.domain.model.ProfileStatus;
import com.example.user.domain.model.UserProfile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;
import java.util.UUID;

public interface UserProfileRepository {

    UserProfile save(UserProfile userProfile);

    Optional<UserProfile> findByUserId(UUID userId);

    boolean existsByUserId(UUID userId);

    Page<UserProfile> findByStatusAndEmailContaining(ProfileStatus status, String email, Pageable pageable);

    Page<UserProfile> findByStatus(ProfileStatus status, Pageable pageable);

    Page<UserProfile> findByEmailContaining(String email, Pageable pageable);

    Page<UserProfile> findAll(Pageable pageable);
}
