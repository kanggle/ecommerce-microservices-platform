package com.example.auth.infrastructure.config;

import com.example.auth.infrastructure.security.JsonAuthenticationEntryPoint;
import com.example.auth.infrastructure.security.JwtAuthenticationFilter;
import com.example.auth.infrastructure.security.AuthRateLimitFilter;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http,
                                           JwtAuthenticationFilter jwtAuthenticationFilter,
                                           AuthRateLimitFilter authRateLimitFilter,
                                           JsonAuthenticationEntryPoint authenticationEntryPoint) throws Exception {
        return http
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .formLogin(AbstractHttpConfigurer::disable)
            .httpBasic(AbstractHttpConfigurer::disable)
            .headers(headers -> headers
                .contentTypeOptions(Customizer.withDefaults())
                .frameOptions(fo -> fo.deny())
                .httpStrictTransportSecurity(hsts -> hsts
                    .includeSubDomains(true)
                    .maxAgeInSeconds(31536000)
                )
            )
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/signup", "/api/auth/login", "/api/auth/refresh",
                    "/api/auth/oauth/**").permitAll()
                .requestMatchers("/actuator/health", "/actuator/info", "/actuator/prometheus").permitAll()
                // /api/internal/**: gateway-service에서 라우팅되지 않아 외부 접근 불가.
                // 내부 운영자는 kubectl port-forward 등으로 파드에 직접 접근한다.
                .requestMatchers("/api/internal/**").permitAll()
                .anyRequest().authenticated()
            )
            .exceptionHandling(e -> e.authenticationEntryPoint(authenticationEntryPoint))
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
            .addFilterBefore(authRateLimitFilter, JwtAuthenticationFilter.class)
            .build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public FilterRegistrationBean<AuthRateLimitFilter> disableAuthRateLimitFilterAutoRegistration(
            AuthRateLimitFilter filter) {
        FilterRegistrationBean<AuthRateLimitFilter> registration = new FilterRegistrationBean<>(filter);
        registration.setEnabled(false);
        return registration;
    }

    @Bean
    public FilterRegistrationBean<JwtAuthenticationFilter> disableJwtAuthFilterAutoRegistration(
            JwtAuthenticationFilter filter) {
        FilterRegistrationBean<JwtAuthenticationFilter> registration = new FilterRegistrationBean<>(filter);
        registration.setEnabled(false);
        return registration;
    }
}
