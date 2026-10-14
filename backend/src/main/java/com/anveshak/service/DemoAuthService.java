package com.anveshak.service;

import java.net.InetAddress;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.anveshak.DTOs.AuthResponse;
import com.anveshak.Exception.UserNotFoundException;
import com.anveshak.config.DemoProperties;
import com.anveshak.model.User;

import lombok.extern.slf4j.Slf4j;

/**
 * Issues sessions for the public demo account. Demo tokens carry the
 * {@link JwtService#DEMO_CLAIM} claim, which {@code DemoSessionGuardFilter}
 * uses to keep the shared library read-only.
 */
@Service
@Slf4j
public class DemoAuthService {

    // JwtService.generateToken takes its expiration in seconds.
    private static final long DEMO_ACCESS_TOKEN_TTL_SECONDS = 60L * 60;
    private static final long DEMO_REFRESH_TOKEN_TTL_SECONDS = 6L * 60 * 60;
    private static final long RATE_LIMIT_WINDOW_MILLIS = 60_000L;

    private final DemoProperties demoProperties;
    private final UserService userService;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;

    private final Map<String, AtomicInteger> loginsInWindow = new ConcurrentHashMap<>();
    private volatile long currentWindow = -1;

    public DemoAuthService(DemoProperties demoProperties, UserService userService, JwtService jwtService,
            RefreshTokenService refreshTokenService) {
        this.demoProperties = demoProperties;
        this.userService = userService;
        this.jwtService = jwtService;
        this.refreshTokenService = refreshTokenService;
    }

    public AuthResponse startDemoSession(InetAddress ipAddress, String userAgent) {
        ensureDemoAvailable();

        if (!tryAcquireLogin(ipAddress.getHostAddress())) {
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS,
                    "Too many demo sessions started from this address. Try again in a minute.");
        }

        User demoUser;
        try {
            demoUser = userService.fetchUserByEmail(demoProperties.email());
        } catch (UserNotFoundException ex) {
            log.warn("Demo is enabled but no user exists for the configured demo email");
            throw demoUnavailable();
        }

        return issueDemoTokens(demoUser, ipAddress, userAgent);
    }

    /**
     * Whether the user is the shared demo account. Checked by account rather than
     * by token claim so that every session for it (refresh, password or Google
     * login) stays read-only, even when an old token no longer decodes.
     */
    public boolean isDemoUser(User user) {
        String email = demoProperties.email();
        return email != null && !email.isBlank() && email.equalsIgnoreCase(user.getEmail());
    }

    public AuthResponse issueDemoTokens(User user, InetAddress ipAddress, String userAgent) {
        Map<String, Object> demoClaim = Map.of(JwtService.DEMO_CLAIM, true);

        String accessToken = jwtService.generateToken(
                user.getId().toString(),
                user.getEmail(),
                user.getUsername(),
                DEMO_ACCESS_TOKEN_TTL_SECONDS,
                demoClaim);

        String refreshToken = jwtService.generateToken(
                user.getId().toString(),
                user.getEmail(),
                user.getUsername(),
                DEMO_REFRESH_TOKEN_TTL_SECONDS,
                demoClaim);

        refreshTokenService.createRefreshToken(refreshToken, user, ipAddress, userAgent,
                DEMO_REFRESH_TOKEN_TTL_SECONDS);

        return new AuthResponse(accessToken, refreshToken);
    }

    private void ensureDemoAvailable() {
        String email = demoProperties.email();
        if (!demoProperties.enabled() || email == null || email.isBlank()) {
            throw demoUnavailable();
        }
    }

    private ResponseStatusException demoUnavailable() {
        return new ResponseStatusException(HttpStatus.NOT_FOUND, "The demo is not available right now.");
    }

    private boolean tryAcquireLogin(String clientKey) {
        long window = System.currentTimeMillis() / RATE_LIMIT_WINDOW_MILLIS;
        if (window != currentWindow) {
            synchronized (this) {
                if (window != currentWindow) {
                    loginsInWindow.clear();
                    currentWindow = window;
                }
            }
        }
        int logins = loginsInWindow.computeIfAbsent(clientKey, key -> new AtomicInteger()).incrementAndGet();
        return logins <= demoProperties.maxLoginsPerMinute();
    }
}
