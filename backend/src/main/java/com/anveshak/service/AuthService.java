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
import com.anveshak.config.GoogleProperties;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class AuthService {
    UserService userService;
    JwtService jwtService;
    AuthTokenService authTokenService;
    AuthMailService authMailService;
    RefreshTokenService refreshTokenService;
    UserIdentityService userIdentityService;
    GoogleTokenVerifier googleTokenVerifier;
    GoogleProperties googleProperties;
    RestTemplate restTemplate;

    public AuthService(UserService userService, JwtService jwtService, AuthTokenService authTokenService,
            AuthMailService authMailService, RefreshTokenService refreshTokenService,
            UserIdentityService userIdentityService, GoogleTokenVerifier googleTokenVerifier,
            GoogleProperties googleProperties, RestTemplate restTemplate) {
        this.userService = userService;
        this.jwtService = jwtService;
        this.authTokenService = authTokenService;
        this.authMailService = authMailService;
        this.refreshTokenService = refreshTokenService;
        this.googleTokenVerifier = googleTokenVerifier;
        this.userIdentityService = userIdentityService;
        this.googleProperties = googleProperties;
        this.restTemplate = restTemplate;
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

        userService.isMailVerified(user); // Check if the user's email is verified

        userIdentityService.validateLocalIdentity(user, loginRequest.password());

        AuthResponse authResponse = issueToken(user, ipAddress, userAgent);

        return authResponse;
    }

    public AuthResponse loginWithGoogle(GoogleLoginRequest request, InetAddress ipAddress, String userAgent)
            throws GoogleIdTokenNotValidException, GeneralSecurityException, IOException {
        GoogleIdToken.Payload idTokenPayload = googleTokenVerifier.verifyToken(request.token_id());
        String googleSub = idTokenPayload.getSubject();
        String email = idTokenPayload.getEmail();

        if (userIdentityService.doesGoogleIdentityExist(googleSub)) {
            User existingUser = userIdentityService.getUserByProviderId(googleSub, AuthProviders.GOOGLE);
            return issueToken(existingUser, ipAddress, userAgent);
        }

        User user;
        if (email != null && !userService.isEmailAvailable(email)) {
            log.info("Google login: User with email {} already exists, linking Google identity", email);
            user = userService.fetchUserByEmail(email);
            userService.markVerified(user);
        } else {
            log.info("Google login: Creating new user for email {}", email);
            user = userService.createUserFromGoogleIdPayload(idTokenPayload);
        }

        if (!userIdentityService.identityExistsAlready(user, AuthProviders.GOOGLE)) {
            userIdentityService.createGooglUserIdentity(user, googleSub);
        }

        return issueToken(user, ipAddress, userAgent);
    }

    public AuthResponse handleGoogleCallback(String code, InetAddress ipAddress, String userAgent) throws Exception {
        return handleGoogleCallback(code, googleProperties.redirectUri(), ipAddress, userAgent);
    }

    public AuthResponse handleGoogleCallback(String code, String redirectUri, InetAddress ipAddress, String userAgent) throws Exception {
        String secret = googleProperties.clientSecret();
        String maskedSecret = (secret != null && secret.length() > 6) ? secret.substring(0, 6) + "...(len=" + secret.length() + ")" : String.valueOf(secret);
        log.info("handleGoogleCallback start: raw code length={}, redirectUri={}, clientId={}, clientSecret={}", 
                code != null ? code.length() : 0, redirectUri, googleProperties.clientId(), maskedSecret);

        if (code == null || code.isBlank()) {
            log.error("handleGoogleCallback failed: Authorization code is null or empty");
            throw new IllegalArgumentException("Authorization code cannot be null or empty");
        }

        String cleanCode = code.trim();

        try {
            log.info("Exchanging code via GoogleAuthorizationCodeTokenRequest with redirect_uri={}", redirectUri);
            com.google.api.client.googleapis.auth.oauth2.GoogleTokenResponse tokenResponse =
                    new com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeTokenRequest(
                            new com.google.api.client.http.javanet.NetHttpTransport(),
                            new com.google.api.client.json.gson.GsonFactory(),
                            "https://oauth2.googleapis.com/token",
                            googleProperties.clientId(),
                            googleProperties.clientSecret(),
                            cleanCode,
                            redirectUri)
                            .execute();

            String idToken = tokenResponse.getIdToken();
            String accessToken = tokenResponse.getAccessToken();
            log.info("GoogleTokenResponse executed successfully. idToken present: {}, accessToken present: {}", 
                    idToken != null, accessToken != null);

            if (idToken != null && !idToken.isBlank()) {
                log.info("id_token successfully extracted, proceeding to loginWithGoogle");
                return loginWithGoogle(new GoogleLoginRequest(idToken), ipAddress, userAgent);
            } else if (accessToken != null && !accessToken.isBlank()) {
                log.info("id_token absent but access_token present, fetching userinfo from Google endpoint");
                HttpHeaders userInfoHeaders = new HttpHeaders();
                userInfoHeaders.setBearerAuth(accessToken);
                HttpEntity<Void> userInfoRequest = new HttpEntity<>(userInfoHeaders);
                ResponseEntity<Map> userInfoResp = restTemplate.exchange(
                        "https://www.googleapis.com/oauth2/v3/userinfo",
                        org.springframework.http.HttpMethod.GET,
                        userInfoRequest,
                        Map.class
                );

                log.info("Google userinfo HTTP status: {}, body: {}", userInfoResp.getStatusCode(), userInfoResp.getBody());
                if (userInfoResp.getStatusCode().is2xxSuccessful() && userInfoResp.getBody() != null) {
                    Map<String, Object> userInfo = userInfoResp.getBody();
                    String googleSub = (String) userInfo.get("sub");
                    String email = (String) userInfo.get("email");
                    log.info("Google userinfo fetched for sub={}, email={}", googleSub, email);

                    if (!userIdentityService.doesGoogleIdentityExist(googleSub)) {
                        User user;
                        if (email != null && !userService.isEmailAvailable(email)) {
                            user = userService.fetchUserByEmail(email);
                            userService.markVerified(user);
                        } else {
                            user = userService.createUserFromGoogleUserInfo(userInfo);
                        }
                        if (!userIdentityService.identityExistsAlready(user, AuthProviders.GOOGLE)) {
                            userIdentityService.createGooglUserIdentity(user, googleSub);
                        }
                        return issueToken(user, ipAddress, userAgent);
                    }

                    User existingUser = userIdentityService.getUserByProviderId(googleSub, AuthProviders.GOOGLE);
                    return issueToken(existingUser, ipAddress, userAgent);
                }
            } else {
                log.error("Neither id_token nor access_token in Google TokenResponse");
                throw new IllegalArgumentException("Google token response missing id_token and access_token");
            }
        } catch (com.google.api.client.auth.oauth2.TokenResponseException e) {
            String errorDetail = e.getDetails() != null ? e.getDetails().toPrettyString() : e.getMessage();
            log.error("Google TokenResponseException status {}: {}", e.getStatusCode(), errorDetail);
            if (e.getStatusCode() == 401) {
                throw new IllegalArgumentException("Google OAuth client authentication failed (HTTP 401 Unauthorized). Your GOOGLE_CLIENT_SECRET or GOOGLE_CLIENT_ID in .env is invalid or does not match your Google Cloud Console credentials.", e);
            }
            throw new IllegalArgumentException("Google OAuth code exchange error (" + e.getStatusCode() + "): " + errorDetail, e);
        } catch (Exception e) {
            log.error("Unexpected exception during Google Token Exchange: {}", e.getMessage(), e);
            throw e;
        }

        throw new IllegalArgumentException("Unable to exchange code with Google: empty token response");
    }

    public String getFrontendUrl() {
        return googleProperties.frontendUrl() != null ? googleProperties.frontendUrl() : "http://localhost:5173";
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
        if (Boolean.TRUE.equals(user.getIsEmailVerified())) {
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
