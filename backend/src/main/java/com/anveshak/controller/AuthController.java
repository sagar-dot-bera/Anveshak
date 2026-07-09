package com.anveshak.controller;

import java.net.InetAddress;
import java.net.UnknownHostException;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.anveshak.DTOs.AuthMessageResponse;
import com.anveshak.DTOs.AuthResponse;
import com.anveshak.DTOs.ForgotPasswordRequest;
import com.anveshak.DTOs.GoogleLoginRequest;
import com.anveshak.DTOs.LoginRequest;
import com.anveshak.DTOs.RefreshTokenRequest;
import com.anveshak.DTOs.RegisterRequest;
import com.anveshak.DTOs.ResetPasswordRequest;
import com.anveshak.DTOs.ResendVerificationTokenRequest;
import com.anveshak.model.User;
import com.anveshak.service.AuthService;
import com.anveshak.service.CurrentUserResolver;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Endpoints for user authentication and authorization")
public class AuthController {

    private final AuthService authService;
    private final CurrentUserResolver currentUserResolver;

    @Operation(summary = "Register a new user", description = "Registers a new user with the provided details.")
    @PostMapping("/register")
    public ResponseEntity<AuthMessageResponse> register(@Valid @RequestBody RegisterRequest registerRequest) {
        authService.registerUser(registerRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(new AuthMessageResponse("Registration successful"));
    }

    @Operation(summary = "Login a user", description = "Logs in a user with the provided credentials.")
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest loginRequest,
            HttpServletRequest request) throws UnknownHostException {
        return ResponseEntity.ok(authService.loginUser(loginRequest, getClientIp(request), getUserAgent(request)));
    }

    @Operation(summary = "Login with Google", description = "Logs in a user using Google OAuth.")
    @PostMapping("/google")
    public ResponseEntity<AuthResponse> googleLogin(@Valid @RequestBody GoogleLoginRequest googleLoginRequest,
            HttpServletRequest request) throws Exception {
        return ResponseEntity
                .ok(authService.loginWithGoogle(googleLoginRequest, getClientIp(request), getUserAgent(request)));
    }

    @Operation(summary = "Refresh tokens", description = "Refreshes the access and refresh tokens using a valid refresh token.")
    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(@Valid @RequestBody RefreshTokenRequest refreshTokenRequest,
            HttpServletRequest request) throws UnknownHostException {
        return ResponseEntity.ok(
                authService.refreshTokens(refreshTokenRequest.token(), getClientIp(request), getUserAgent(request)));
    }

    @Operation
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@Valid @RequestBody RefreshTokenRequest refreshTokenRequest) {
        authService.logout(refreshTokenRequest.token());
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Logout from all sessions", description = "Logs out the user from all active sessions.")
    @PostMapping("/logout-all")
    public ResponseEntity<Void> logoutAll(@RequestHeader("Authorization") String authorizationHeader) {
        User user = currentUserResolver.resolveUser(authorizationHeader);
        authService.logoutAll(user);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Verify email", description = "Verifies the user's email using a verification token.")
    @GetMapping("/verify-email")
    public ResponseEntity<AuthMessageResponse> verifyEmail(@RequestParam("token") String token) {
        authService.verifyEmail(token);
        return ResponseEntity.ok(new AuthMessageResponse("Email verified"));
    }

    @Operation(summary = "Resend verification email", description = "Resends the email verification token to the user's email.")
    @GetMapping("/verify-email/{token}")
    public ResponseEntity<AuthMessageResponse> verifyEmailPath(@PathVariable String token) {
        authService.verifyEmail(token);
        return ResponseEntity.ok(new AuthMessageResponse("Email verified"));
    }

    @Operation(summary = "Resend verification email", description = "Resends the email verification token to the user's email.")
    @PostMapping("/resend-verification")
    public ResponseEntity<AuthMessageResponse> resendVerification(
            @Valid @RequestBody ResendVerificationTokenRequest request) {
        authService.resendVerification(request.email());
        return ResponseEntity.ok(new AuthMessageResponse("Verification email sent"));
    }

    @Operation(summary = "Forgot password", description = "Sends a password reset email to the user's email.")
    @PostMapping("/forgot-password")
    public ResponseEntity<AuthMessageResponse> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request.email());
        return ResponseEntity.ok(new AuthMessageResponse("Password reset email sent"));
    }

    @Operation(summary = "Reset password", description = "Resets the user's password using a valid reset token.")
    @PostMapping("/reset-password")
    public ResponseEntity<AuthMessageResponse> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok(new AuthMessageResponse("Password reset successful"));
    }

    private InetAddress getClientIp(HttpServletRequest request) throws UnknownHostException {
        return InetAddress.getByName(request.getRemoteAddr());
    }

    private String getUserAgent(HttpServletRequest request) {
        String userAgent = request.getHeader("User-Agent");
        return userAgent == null ? "unknown" : userAgent;
    }
}
