package com.anveshak.controller;

import java.net.InetAddress;
import java.net.UnknownHostException;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.anveshak.DTOs.AuthResponse;
import com.anveshak.service.AuthService;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/auth/google")
@RequiredArgsConstructor
@Slf4j
public class GoogleApiOAuthCallbackController {

    private final AuthService authService;

    @GetMapping("/callback")
    public ResponseEntity<Void> googleCallback(@RequestParam(value = "code", required = false) String code,
            @RequestParam(value = "error", required = false) String error,
            HttpServletRequest request) {
        log.info("Received /api/auth/google/callback code={}, error={}", code != null ? "[PRESENT]" : "null", error);
        String frontendUrl = authService.getFrontendUrl();
        if (error != null || code == null || code.isBlank()) {
            String redirectUrl = frontendUrl + "/login?error=" + (error != null ? error : "google_auth_failed");
            return ResponseEntity.status(HttpStatus.FOUND).header("Location", redirectUrl).build();
        }

        try {
            AuthResponse authResponse = authService.handleGoogleCallback(code, getClientIp(request), getUserAgent(request));
            String redirectUrl = String.format("%s/login?accessToken=%s&refreshToken=%s",
                    frontendUrl, authResponse.accessToken(), authResponse.refreshToken());
            return ResponseEntity.status(HttpStatus.FOUND).header("Location", redirectUrl).build();
        } catch (Exception e) {
            log.error("Error in /api/auth/google/callback: {}", e.getMessage(), e);
            String redirectUrl = frontendUrl + "/login?error=" + java.net.URLEncoder.encode(e.getMessage(), java.nio.charset.StandardCharsets.UTF_8);
            return ResponseEntity.status(HttpStatus.FOUND).header("Location", redirectUrl).build();
        }
    }

    @PostMapping("/code")
    public ResponseEntity<AuthResponse> googleCodeExchange(@RequestBody java.util.Map<String, String> body,
            HttpServletRequest request) throws Exception {
        log.info("Received /api/auth/google/code request with body keys: {}", body.keySet());
        String code = body.get("code");
        String redirectUri = body.get("redirect_uri");
        if (redirectUri == null || redirectUri.isBlank()) {
            redirectUri = "postmessage";
        }

        try {
            log.info("Executing /api/auth/google/code exchange with redirectUri={}", redirectUri);
            AuthResponse authResponse = authService.handleGoogleCallback(code, redirectUri, getClientIp(request), getUserAgent(request));
            log.info("/api/auth/google/code exchange succeeded!");
            return ResponseEntity.ok(authResponse);
        } catch (IllegalArgumentException e) {
            log.warn("Primary /api/auth/google/code exchange failed: {}", e.getMessage());
            if ("postmessage".equals(redirectUri)) {
                try {
                    log.info("Attempting fallback /api/auth/google/code exchange with frontendUrl={}", authService.getFrontendUrl());
                    AuthResponse authResponse = authService.handleGoogleCallback(code, authService.getFrontendUrl(), getClientIp(request), getUserAgent(request));
                    log.info("Fallback /api/auth/google/code exchange succeeded!");
                    return ResponseEntity.ok(authResponse);
                } catch (Exception fallbackEx) {
                    log.error("Fallback /api/auth/google/code exchange also failed: {}", fallbackEx.getMessage());
                }
            }
            throw e;
        }
    }

    private InetAddress getClientIp(HttpServletRequest request) {
        try {
            return InetAddress.getByName(request.getRemoteAddr());
        } catch (UnknownHostException e) {
            return InetAddress.getLoopbackAddress();
        }
    }

    private String getUserAgent(HttpServletRequest request) {
        String userAgent = request.getHeader("User-Agent");
        return userAgent == null ? "unknown" : userAgent;
    }
}
