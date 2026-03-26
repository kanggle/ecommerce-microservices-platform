package com.example.user.infrastructure.persistence;

import com.example.user.domain.model.ProfileStatus;
import com.example.user.domain.model.UserProfile;
import com.example.user.domain.repository.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class UserProfileRepositoryImpl implements UserProfileRepository {

    private final UserProfileJpaRepository jpaRepository;
    private final UserProfileJpaMapper mapper;

    @Override
    public UserProfile save(UserProfile userProfile) {
        UserProfileJpaEntity entity = mapper.toEntity(userProfile);
        UserProfileJpaEntity saved = jpaRepository.save(entity);
        return mapper.toDomain(saved);
    }

    @Override
    public Optional<UserProfile> findByUserId(UUID userId) {
        return jpaRepository.findByUserId(userId).map(mapper::toDomain);
    }

    @Override
    public boolean existsByUserId(UUID userId) {
        return jpaRepository.existsByUserId(userId);
    }

    @Override
    public Page<UserProfile> findByStatusAndEmailContaining(ProfileStatus status, String email, Pageable pageable) {
        return jpaRepository.findByStatusAndEmailContaining(status, email, pageable).map(mapper::toDomain);
    }

    @Override
    public Page<UserProfile> findByStatus(ProfileStatus status, Pageable pageable) {
        return jpaRepository.findByStatus(status, pageable).map(mapper::toDomain);
    }

    @Override
    public Page<UserProfile> findByEmailContaining(String email, Pageable pageable) {
        return jpaRepository.findByEmailContaining(email, pageable).map(mapper::toDomain);
    }

    @Override
    public Page<UserProfile> findAll(Pageable pageable) {
        return jpaRepository.findAll(pageable).map(mapper::toDomain);
    }
}
