package com.example.auth.presentation.controller;

import com.example.auth.application.dto.LoginResult;
import com.example.auth.application.dto.OAuthLoginCommand;
import com.example.auth.application.exception.OAuthUpstreamException;
import com.example.auth.application.service.GoogleOAuthService;
import com.example.auth.application.service.GoogleOAuthService.CallbackResult;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.net.URI;
import java.util.Optional;

@Slf4j
@RestController
@RequestMapping("/api/auth/oauth")
@RequiredArgsConstructor
public class OAuthController {

    private final GoogleOAuthService googleOAuthService;

    @GetMapping("/google")
    public ResponseEntity<Void> initiateGoogleLogin(
            @RequestParam String callbackUrl) {

        String authorizationUrl = googleOAuthService.buildAuthorizationUrl(callbackUrl);

        return ResponseEntity.status(HttpStatus.FOUND)
            .location(URI.create(authorizationUrl))
            .build();
    }

    @GetMapping("/google/callback")
    public void handleGoogleCallback(
            @RequestParam(required = false) String code,
            @RequestParam(required = false) String state,
            @RequestParam(required = false) String error,
            HttpServletResponse response) throws IOException {

        if (error != null) {
            log.warn("Google OAuth callback error: error={}, state={}", error,
                state != null ? "[present]" : null);

            Optional<String> callbackUrlOpt = googleOAuthService.resolveCallbackUrl(state);
            if (callbackUrlOpt.isPresent()) {
                String redirectUrl = UriComponentsBuilder.fromUriString(callbackUrlOpt.get())
                    .queryParam("error", "oauth_failed")
                    .build()
                    .toUriString();
                response.sendRedirect(redirectUrl);
                return;
            }

            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "OAuth callback error");
            return;
        }

        if (code == null || state == null) {
            log.warn("Google OAuth callback missing parameters: code={}, state={}",
                code != null ? "[present]" : null, state != null ? "[present]" : null);
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "OAuth callback missing required parameters");
            return;
        }

        OAuthLoginCommand command = new OAuthLoginCommand(code, state);
        CallbackResult result;
        try {
            result = googleOAuthService.handleCallback(command);
        } catch (OAuthUpstreamException e) {
            log.error("Google OAuth upstream error during callback", e);
            if (e.getCallbackUrl() != null) {
                String redirectUrl = UriComponentsBuilder.fromUriString(e.getCallbackUrl())
                    .queryParam("error", "oauth_failed")
                    .build()
                    .toUriString();
                response.sendRedirect(redirectUrl);
                return;
            }
            response.sendError(HttpServletResponse.SC_BAD_GATEWAY, "OAuth provider returned an error");
            return;
        }

        if (!result.success()) {
            String redirectUrl = UriComponentsBuilder.fromUriString(result.callbackUrl())
                .queryParam("error", "oauth_failed")
                .build()
                .toUriString();
            response.sendRedirect(redirectUrl);
            return;
        }

        LoginResult loginResult = result.loginResult();
        String redirectUrl = UriComponentsBuilder.fromUriString(result.callbackUrl())
            .queryParam("accessToken", loginResult.accessToken())
            .queryParam("refreshToken", loginResult.refreshToken())
            .build()
            .toUriString();
        response.sendRedirect(redirectUrl);
    }
}
