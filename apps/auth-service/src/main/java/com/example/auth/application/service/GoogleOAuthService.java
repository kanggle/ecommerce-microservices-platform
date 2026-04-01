package com.example.auth.application.service;

import com.example.auth.application.dto.LoginResult;
import com.example.auth.application.dto.OAuthLoginCommand;
import com.example.auth.application.exception.OAuthException;
import com.example.auth.application.exception.OAuthUpstreamException;
import com.example.auth.domain.entity.User;
import com.example.auth.domain.repository.OAuthStateStore;
import com.example.auth.domain.repository.RefreshTokenStore;
import com.example.auth.domain.repository.UserRepository;
import com.example.auth.domain.repository.UserSessionRegistry;
import com.example.auth.domain.service.GoogleOAuthPort;
import com.example.auth.domain.service.GoogleOAuthPort.GoogleUserInfo;
import com.example.auth.domain.service.OAuthCallbackProperties;
import com.example.auth.domain.service.SessionProperties;
import com.example.auth.domain.service.TokenGenerator;
import com.example.auth.domain.service.TokenProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class GoogleOAuthService {

    private static final String OAUTH_PROVIDER = "google";
    private static final Duration STATE_TTL = Duration.ofMinutes(10);

    private final OAuthStateStore oauthStateStore;
    private final GoogleOAuthPort googleOAuthPort;
    private final UserRepository userRepository;
    private final RefreshTokenStore refreshTokenStore;
    private final TokenGenerator tokenGenerator;
    private final TokenProperties tokenProperties;
    private final SessionProperties sessionProperties;
    private final UserSessionRegistry sessionRegistry;
    private final OAuthCallbackProperties oauthCallbackProperties;

    public String buildAuthorizationUrl(String callbackUrl) {
        if (!oauthCallbackProperties.allowedCallbackUrls().contains(callbackUrl)) {
            throw new OAuthException("Invalid callbackUrl");
        }
        String state = UUID.randomUUID().toString();
        oauthStateStore.save(state, callbackUrl, STATE_TTL);
        return googleOAuthPort.buildAuthorizationUrl(state, oauthCallbackProperties.googleRedirectUri());
    }

    /**
     * Retrieves the callbackUrl from Redis using the state parameter.
     * Returns empty if state is invalid or expired.
     */
    public Optional<String> resolveCallbackUrl(String state) {
        if (state == null || state.isBlank()) {
            return Optional.empty();
        }
        return oauthStateStore.getAndDelete(state);
    }

    @Transactional
    public CallbackResult handleCallback(OAuthLoginCommand command) {
        Optional<String> callbackUrlOpt = oauthStateStore.getAndDelete(command.state());
        if (callbackUrlOpt.isEmpty()) {
            throw new OAuthException("Invalid or expired OAuth state");
        }
        String callbackUrl = callbackUrlOpt.get();

        GoogleUserInfo userInfo;
        try {
            userInfo = googleOAuthPort.fetchUserInfo(command.code(), oauthCallbackProperties.googleRedirectUri());
        } catch (Exception e) {
            log.error("Failed to fetch Google user info", e);
            throw new OAuthUpstreamException("Google API call failed", callbackUrl, e);
        }

        if (userInfo.email() == null || userInfo.email().isBlank()) {
            log.warn("Google OAuth returned user without email");
            return CallbackResult.failure(callbackUrl);
        }

        User user;
        try {
            String normalizedEmail = userInfo.email().toLowerCase().trim();
            user = userRepository.findByEmail(normalizedEmail)
                .orElseGet(() -> createOAuthUser(normalizedEmail, userInfo.name()));
        } catch (DataAccessException e) {
            log.error("DB error during OAuth user lookup/creation", e);
            return CallbackResult.failure(callbackUrl);
        }

        if (!user.isActive()) {
            log.warn("OAuth login rejected: account deactivated, userId={}", user.getId());
            return CallbackResult.failure(callbackUrl);
        }

        String accessToken = tokenGenerator.generateAccessToken(user);
        String refreshToken = UUID.randomUUID().toString();

        try {
            refreshTokenStore.save(refreshToken, user.getId(), tokenProperties.refreshTokenTtlSeconds());
        } catch (DataAccessException e) {
            log.error("OAuth login failed: Redis error during refresh token save, userId={}", user.getId(), e);
            return CallbackResult.failure(callbackUrl);
        }

        try {
            sessionRegistry.registerSession(
                user.getId(), refreshToken, sessionProperties.inactivityTimeoutSeconds());
        } catch (DataAccessException e) {
            log.error("Session registry failed during OAuth login, userId={}", user.getId(), e);
        }

        log.info("OAuth login succeeded: userId={}, provider={}", user.getId(), OAUTH_PROVIDER);
        LoginResult loginResult = new LoginResult(accessToken, refreshToken, tokenGenerator.accessTokenTtlSeconds());
        return CallbackResult.success(callbackUrl, loginResult);
    }

    private User createOAuthUser(String email, String name) {
        String displayName = (name != null && !name.isBlank()) ? name : email.split("@")[0];
        User newUser = User.createOAuthUser(email, displayName, OAUTH_PROVIDER);
        return userRepository.save(newUser);
    }

    public record CallbackResult(boolean success, String callbackUrl, LoginResult loginResult) {

        public static CallbackResult success(String callbackUrl, LoginResult loginResult) {
            return new CallbackResult(true, callbackUrl, loginResult);
        }

        public static CallbackResult failure(String callbackUrl) {
            return new CallbackResult(false, callbackUrl, null);
        }
    }
}
