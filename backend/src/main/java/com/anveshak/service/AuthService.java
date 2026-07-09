package com.anveshak.service;

import java.io.IOException;
import java.net.InetAddress;
import java.security.GeneralSecurityException;

import org.springframework.stereotype.Service;

import com.anveshak.DTOs.AuthResponse;
import com.anveshak.DTOs.GoogleLoginRequest;
import com.anveshak.DTOs.LoginRequest;
import com.anveshak.DTOs.RegisterRequest;
import com.anveshak.DTOs.ResetPasswordRequest;
import com.anveshak.Exception.GoogleIdTokenNotValidException;
import com.anveshak.Exception.InvalidCredentialsException;
import com.anveshak.model.AuthToken;
import com.anveshak.model.AuthProviders;
import com.anveshak.model.AuthTokenTypes;
import com.anveshak.model.RefreshToken;
import com.anveshak.model.User;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;

@Service
public class AuthService {
    UserService userService;
    JwtService jwtService;
    AuthTokenService authTokenService;
    AuthMailService authMailService;
    RefreshTokenService refreshTokenService;
    UserIdentityService userIdentityService;
    GoogleTokenVerifier googleTokenVerifier;

    public AuthService(UserService userService, JwtService jwtService, AuthTokenService authTokenService,
            AuthMailService authMailService, RefreshTokenService refreshTokenService,
            UserIdentityService userIdentityService, GoogleTokenVerifier googleTokenVerifier) {
        this.userService = userService;
        this.jwtService = jwtService;
        this.authTokenService = authTokenService;
        this.authMailService = authMailService;
        this.refreshTokenService = refreshTokenService;
        this.googleTokenVerifier = googleTokenVerifier;
        this.userIdentityService = userIdentityService;
    }

    public void registerUser(RegisterRequest registerRequest) {
        User newUser = userService.createNewUser(registerRequest);

        String token = jwtService.generateToken(
                newUser.getId().toString(),
                newUser.getEmail(),
                newUser.getUsername(),
                3600000L);

        authTokenService.saveToken(
                newUser,
                token,
                3600000L,
                AuthTokenTypes.EMAIL_VERIFICATION);

        userIdentityService.createLocalIdentity(newUser, registerRequest.password());

        authMailService.sendEmailVerificationToken(newUser.getEmail(), token);

    }

    public AuthResponse loginUser(LoginRequest loginRequest, InetAddress ipAddress, String userAgent) {
        User user = userService.fetchUserByEmail(loginRequest.email());

        userIdentityService.validateLocalIdentity(user, loginRequest.password());

        AuthResponse authResponse = issueToken(user, ipAddress, userAgent);

        return authResponse;
    }

    public AuthResponse loginWithGoogle(GoogleLoginRequest request, InetAddress ipAddress, String userAgent)
            throws GoogleIdTokenNotValidException, GeneralSecurityException, IOException {
        GoogleIdToken.Payload idTokenPayload = googleTokenVerifier.verifyToken(request.token_id());

        if (!userIdentityService.doesGoogleIdentityExist(idTokenPayload.getSubject())) {
            // User does not exist, create a new user
            User newUser = userService.createUserFromGoogleIdPayload(idTokenPayload);
            userIdentityService.createGooglUserIdentity(newUser, idTokenPayload.getSubject());
            return issueToken(newUser, ipAddress, userAgent);
        }

        User existingUser = userIdentityService.getUserByProviderId(idTokenPayload.getSubject(), AuthProviders.GOOGLE);
        return issueToken(existingUser, ipAddress, userAgent);
    }

    public void verifyEmail(String token) {
        AuthToken authToken = authTokenService.getAuthToken(token, AuthTokenTypes.EMAIL_VERIFICATION);
        if (authToken == null) {
            throw new IllegalArgumentException("Verification token is invalid or expired");
        }

        userService.markVerified(authToken.getUser());
        authTokenService.deleteAuthToken(token, AuthTokenTypes.EMAIL_VERIFICATION);
    }

    public void resendVerification(String email) {
        User user = userService.fetchUserByEmail(email);
        if (Boolean.TRUE.equals(user.getIsVerified())) {
            return;
        }

        String token = jwtService.generateToken(
                user.getId().toString(),
                user.getEmail(),
                user.getUsername(),
                3600000L);

        authTokenService.saveToken(
                user,
                token,
                3600000L,
                AuthTokenTypes.EMAIL_VERIFICATION);

        authMailService.sendEmailVerificationToken(user.getEmail(), token);
    }

    public void forgotPassword(String email) {
        User user = userService.fetchUserByEmail(email);

        String token = jwtService.generateToken(
                user.getId().toString(),
                user.getEmail(),
                user.getUsername(),
                3600000L);

        authTokenService.saveToken(user, token, 3600000L, AuthTokenTypes.PASSWORD_RESET);
        authMailService.sendEmailResetPasswordToken(user.getEmail(), token);
    }

    public void resetPassword(ResetPasswordRequest request) {
        AuthToken authToken = authTokenService.getAuthToken(request.token(), AuthTokenTypes.PASSWORD_RESET);
        if (authToken == null) {
            throw new IllegalArgumentException("Password reset token is invalid or expired");
        }

        userIdentityService.resetLocalPassword(authToken.getUser(), request.newPassword());
        authTokenService.deleteAuthToken(request.token(), AuthTokenTypes.PASSWORD_RESET);
    }

    public AuthResponse refreshTokens(String refreshToken, InetAddress ipAddress, String userAgent) {
        RefreshToken storedRefreshToken = refreshTokenService.revokeRefreshToken(refreshToken);
        return issueToken(storedRefreshToken.getUser(), ipAddress, userAgent);
    }

    public void logout(String refreshToken) {
        refreshTokenService.revokeRefreshToken(refreshToken);
    }

    public void logoutAll(User user) {
        refreshTokenService.revokeAllRefreshTokensForUser(user);
    }

    private AuthResponse issueToken(User user, InetAddress ipAddress, String userAgent) {
        String accessToken = jwtService.generateToken(
                user.getId().toString(),
                user.getEmail(),
                user.getUsername(),
                3600000L);

        String refreshToken = jwtService.generateToken(
                user.getId().toString(),
                user.getEmail(),
                user.getUsername(),
                604800000L);

        refreshTokenService.createRefreshToken(refreshToken, user, ipAddress, userAgent);

        return new AuthResponse(accessToken, refreshToken);
    }
}
