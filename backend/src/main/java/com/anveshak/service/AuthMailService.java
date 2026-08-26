package com.anveshak.service;

import com.anveshak.repository.RefreshTokenRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.anveshak.DTOs.ResendVerificationTokenRequest;
import com.anveshak.Exception.UserNotFoundException;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class AuthMailService {
    private final RefreshTokenRepository refreshTokenRepository;
    private final UserService userService;

    private final EmailSenderService emailSenderService;
    @Value("${app.base-url}")
    String baseUrl;

    @Value("${app.mail.from}")
    String from;

    @Value("${MAIL_PASSWORD:NOT_FOUND}")
    private String password;

    public AuthMailService(EmailSenderService emailSenderService, RefreshTokenRepository refreshTokenRepository,
            UserService userService) {
        this.emailSenderService = emailSenderService;
        this.refreshTokenRepository = refreshTokenRepository;
        this.userService = userService;
    }

    public void sendEmailVerificationToken(String email, String token) {

        if (email == null) {
            log.warn("Email is null, cannot send verification email.");
            throw new IllegalArgumentException("Email cannot be null");
        }

        if (token == null) {
            log.warn("Token is null, cannot send verification email.");
            throw new IllegalArgumentException("Token cannot be null");
        }

        String verifyUrl = baseUrl + "/auth/verify-email?token=" + token;

        log.info("password: {}", password);

        emailSenderService.sendPlainText(email, "Verify your email",
                "Welcome to Anveshak Please verify your email by clicking: " + verifyUrl
                        + "\nThis link expires in 1 hours.",
                from);

    }

    public void sendEmailResetPasswordToken(String email, String token) {
        if (email == null) {
            log.warn("Email is null, cannot send password reset email.");
            throw new IllegalArgumentException("Email cannot be null");
        }

        if (token == null) {
            log.warn("Token is null, cannot send password reset email.");
            throw new IllegalArgumentException("Token cannot be null");
        }

        if (!userService.doesUserExistByEmail(email)) {
            log.warn("User with email {} does not exist, cannot send password reset email.", email);
            throw new UserNotFoundException(email);
        }

        String verifyUrl = baseUrl + "/auth/reset-password?token=" + token;

        emailSenderService.sendPlainText(email, "Reset your password",
                " for Plug AI by clicking: " + verifyUrl
                        + "\nThis link expires in 1 hours.",
                from);
    }

    public void resendEmailVerificationToken(String email, String token) {

        if (email == null) {
            log.warn("RefreshTokenRepository is null, cannot resend verification token.");
            throw new IllegalStateException("RefreshTokenRepository cannot be null");
        }

        if (!userService.doesUserExistByEmail(email)) {
            log.warn("User with email {} does not exist, cannot resend verification token.", email);
            throw new UserNotFoundException(email);
        }

        sendEmailVerificationToken(email, token);
    }
}
