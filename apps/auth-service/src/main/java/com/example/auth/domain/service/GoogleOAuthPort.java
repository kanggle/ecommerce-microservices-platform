package com.example.auth.domain.service;

public interface GoogleOAuthPort {

    String buildAuthorizationUrl(String state, String redirectUri);

    GoogleUserInfo fetchUserInfo(String code, String redirectUri);

    record GoogleUserInfo(String email, String name) {}
}
