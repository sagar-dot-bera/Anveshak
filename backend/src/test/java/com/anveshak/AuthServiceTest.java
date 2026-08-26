package com.anveshak;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;

import java.net.InetAddress;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.exceptions.base.MockitoException;
import org.mockito.junit.jupiter.MockitoExtension;

import com.anveshak.DTOs.AuthResponse;
import com.anveshak.DTOs.LoginRequest;
import com.anveshak.model.User;
import com.anveshak.model.UserIdentity;
import com.anveshak.service.AuthMailService;
import com.anveshak.service.AuthService;
import com.anveshak.service.AuthTokenService;
import com.anveshak.service.GoogleTokenVerifier;
import com.anveshak.service.JwtService;
import com.anveshak.service.RefreshTokenService;
import com.anveshak.service.UserIdentityService;
import com.anveshak.service.UserService;

@ExtendWith(MockitoExtension.class)
public class AuthServiceTest {

    @Mock
    UserService userService;

    @Mock
    JwtService jwtService;

    @Mock
    AuthTokenService authTokenService;

    @Mock
    AuthMailService authMailService;

    @Mock
    RefreshTokenService refreshTokenService;

    @Mock
    UserIdentityService userIdentityService;

    @Mock
    GoogleTokenVerifier googleTokenVerifier;

    @InjectMocks
    AuthService authService;

    @Test
    void shouldLoginWork() {
        User user = new User();
        user.setId(java.util.UUID.randomUUID());
        user.setEmail("kenji@gmail.com");

        when(userService.fetchUserByEmail("kenji@gmail.com")).thenReturn(user);

        LoginRequest loginRequest = new LoginRequest("kenji@gmail.com", "password");

        when(jwtService.generateToken(any(), any(), any(), anyLong())).thenReturn("accessToken", "refreshToken");

        AuthResponse authResponse = authService.loginUser(loginRequest, InetAddress.getLoopbackAddress(), "chrome");

        assertEquals("accessToken", authResponse.accessToken());
        assertEquals("refreshToken", authResponse.refreshToken());

        

    }

}
