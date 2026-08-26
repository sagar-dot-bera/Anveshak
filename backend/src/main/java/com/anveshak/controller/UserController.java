package com.anveshak.controller;

import java.util.List;
import java.util.UUID;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.anveshak.DTOs.ChangePasswordRequest;
import com.anveshak.DTOs.GoogleLoginRequest;
import com.anveshak.DTOs.UpdateProfileRequest;
import com.anveshak.DTOs.UserIdentityResponse;
import com.anveshak.DTOs.UserProfileResponse;
import com.anveshak.DTOs.UserSessionResponse;
import com.anveshak.model.RefreshToken;
import com.anveshak.model.User;
import com.anveshak.model.UserIdentity;
import com.anveshak.service.CurrentUserResolver;
import com.anveshak.service.GoogleTokenVerifier;
import com.anveshak.service.RefreshTokenService;
import com.anveshak.service.UserIdentityService;
import com.anveshak.service.UserService;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@Tag(name = "User Management", description = "Endpoints for managing user profiles, identities, and sessions")
public class UserController {

    private final CurrentUserResolver currentUserResolver;
    private final UserService userService;
    private final UserIdentityService userIdentityService;
    private final RefreshTokenService refreshTokenService;
    private final GoogleTokenVerifier googleTokenVerifier;

    @Tag(name = "User Management", description = "Endpoints for managing user profiles, identities, and sessions")
    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> me(@RequestHeader("Authorization") String authorizationHeader) {
        User user = currentUserResolver.resolveUser(authorizationHeader);
        return ResponseEntity.ok(toProfileResponse(user));
    }

    @Tag(name = "User Management", description = "Endpoints for managing user profiles, identities, and sessions")
    @PatchMapping("/me")
    public ResponseEntity<UserProfileResponse> updateMe(@RequestHeader("Authorization") String authorizationHeader,
            @Valid @RequestBody UpdateProfileRequest request) {
        User user = currentUserResolver.resolveUser(authorizationHeader);
        return ResponseEntity.ok(toProfileResponse(userService.updateUserProfile(user, request)));
    }

    @Tag(name = "User Management", description = "Endpoints for managing user profiles, identities, and sessions")
    @PatchMapping("/me/password")
    public ResponseEntity<Void> changePassword(@RequestHeader("Authorization") String authorizationHeader,
            @Valid @RequestBody ChangePasswordRequest request) {
        User user = currentUserResolver.resolveUser(authorizationHeader);
        userIdentityService.changeLocalPassword(user, request.currentPassword(), request.newPassword());
        return ResponseEntity.noContent().build();
    }

    @Tag(name = "User Management", description = "Endpoints for managing user profiles, identities, and sessions")
    @GetMapping("/me/identities")
    public ResponseEntity<List<UserIdentityResponse>> identities(
            @RequestHeader("Authorization") String authorizationHeader) {
        User user = currentUserResolver.resolveUser(authorizationHeader);
        return ResponseEntity.ok(userIdentityService.getIdentitiesForUser(user).stream()
                .map(this::toIdentityResponse)
                .toList());
    }

    @Tag(name = "User Management", description = "Endpoints for managing user profiles, identities, and sessions")
    @PostMapping("/me/link/google")
    public ResponseEntity<UserIdentityResponse> linkGoogle(@RequestHeader("Authorization") String authorizationHeader,
            @Valid @RequestBody GoogleLoginRequest request) throws Exception {
        User user = currentUserResolver.resolveUser(authorizationHeader);
        String providerId = googleTokenVerifier.verifyToken(request.token_id()).getSubject();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(toIdentityResponse(userIdentityService.linkGoogleIdentity(user, providerId)));
    }

    @Tag(name = "User Management", description = "Endpoints for managing user profiles, identities, and sessions")
    @DeleteMapping("/me/link/google")
    public ResponseEntity<Void> unlinkGoogle(@RequestHeader("Authorization") String authorizationHeader) {
        User user = currentUserResolver.resolveUser(authorizationHeader);
        userIdentityService.unlinkGoogleIdentity(user);
        return ResponseEntity.noContent().build();
    }

    @Tag(name = "User Management", description = "Endpoints for managing user profiles, identities, and sessions")
    @GetMapping("/me/sessions")
    public ResponseEntity<List<UserSessionResponse>> sessions(
            @RequestHeader("Authorization") String authorizationHeader) {
        User user = currentUserResolver.resolveUser(authorizationHeader);
        return ResponseEntity.ok(refreshTokenService.getActiveRefreshTokens(user).stream()
                .map(this::toSessionResponse)
                .toList());
    }

    @Tag(name = "User Management", description = "Endpoints for managing user profiles, identities, and sessions")
    @DeleteMapping("/me/sessions/{sessionId}")
    public ResponseEntity<Void> revokeSession(@RequestHeader("Authorization") String authorizationHeader,
            @PathVariable UUID sessionId) {
        User user = currentUserResolver.resolveUser(authorizationHeader);
        refreshTokenService.revokeRefreshTokenByIdAndUser(sessionId, user);
        return ResponseEntity.noContent().build();
    }

    private UserProfileResponse toProfileResponse(User user) {
        return new UserProfileResponse(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getUsername(),
                user.getEmail(),
                Boolean.TRUE.equals(user.getIsEmailVerified()),
                user.getCreatedAt(),
                user.getUpdatedAt());
    }

    private UserIdentityResponse toIdentityResponse(UserIdentity userIdentity) {
        return new UserIdentityResponse(
                userIdentity.getId(),
                userIdentity.getProvider(),
                userIdentity.getProviderUserId(),
                userIdentity.getCreatedAt());
    }

    private UserSessionResponse toSessionResponse(RefreshToken refreshToken) {
        return new UserSessionResponse(
                refreshToken.getId(),
                refreshToken.getDeviceName(),
                refreshToken.getIpAddress() == null ? null : refreshToken.getIpAddress().getHostAddress(),
                refreshToken.getCreatedAt(),
                refreshToken.getExpiresAt(),
                Boolean.TRUE.equals(refreshToken.getRevoked()));
    }
}
