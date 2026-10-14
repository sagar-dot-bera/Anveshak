package com.anveshak;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import java.net.InetAddress;
import java.util.Map;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import com.anveshak.DTOs.AuthResponse;
import com.anveshak.Exception.UserNotFoundException;
import com.anveshak.config.DemoProperties;
import com.anveshak.model.User;
import com.anveshak.service.DemoAuthService;
import com.anveshak.service.JwtService;
import com.anveshak.service.RefreshTokenService;
import com.anveshak.service.UserService;

@ExtendWith(MockitoExtension.class)
public class DemoAuthServiceTest {

    private static final InetAddress CLIENT = InetAddress.getLoopbackAddress();

    @Mock
    UserService userService;

    @Mock
    JwtService jwtService;

    @Mock
    RefreshTokenService refreshTokenService;

    private DemoAuthService service(boolean enabled, String email, int maxLoginsPerMinute) {
        return new DemoAuthService(new DemoProperties(enabled, email, maxLoginsPerMinute), userService, jwtService,
                refreshTokenService);
    }

    private User demoUser() {
        User user = new User();
        user.setId(UUID.randomUUID());
        user.setEmail("demo@anveshak.test");
        user.setUsername("demo");
        return user;
    }

    @Test
    void shouldIssueTokensMarkedAsDemo() {
        User user = demoUser();
        when(userService.fetchUserByEmail("demo@anveshak.test")).thenReturn(user);
        when(jwtService.generateToken(any(), any(), any(), anyLong(), any())).thenReturn("access", "refresh");

        AuthResponse response = service(true, "demo@anveshak.test", 10).startDemoSession(CLIENT, "chrome");

        assertEquals("access", response.accessToken());
        assertEquals("refresh", response.refreshToken());
        verify(jwtService, org.mockito.Mockito.times(2)).generateToken(eq(user.getId().toString()),
                eq(user.getEmail()), eq(user.getUsername()), anyLong(), eq(Map.of(JwtService.DEMO_CLAIM, true)));
        verify(refreshTokenService).createRefreshToken("refresh", user, CLIENT, "chrome", 6L * 60 * 60);
    }

    @Test
    void shouldReturnNotFoundWhenDemoDisabled() {
        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> service(false, "demo@anveshak.test", 10).startDemoSession(CLIENT, "chrome"));

        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
        verifyNoInteractions(userService, jwtService, refreshTokenService);
    }

    @Test
    void shouldReturnNotFoundWhenDemoEmailMissing() {
        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> service(true, " ", 10).startDemoSession(CLIENT, "chrome"));

        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
    }

    @Test
    void shouldReturnNotFoundWhenDemoUserDoesNotExist() {
        when(userService.fetchUserByEmail("demo@anveshak.test")).thenThrow(new UserNotFoundException("demo@anveshak.test"));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> service(true, "demo@anveshak.test", 10).startDemoSession(CLIENT, "chrome"));

        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
        verifyNoInteractions(jwtService, refreshTokenService);
    }

    @Test
    void shouldRateLimitDemoLoginsPerClient() {
        when(userService.fetchUserByEmail("demo@anveshak.test")).thenReturn(demoUser());
        when(jwtService.generateToken(any(), any(), any(), anyLong(), any())).thenReturn("token");
        DemoAuthService demoAuthService = service(true, "demo@anveshak.test", 2);

        demoAuthService.startDemoSession(CLIENT, "chrome");
        demoAuthService.startDemoSession(CLIENT, "chrome");
        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> demoAuthService.startDemoSession(CLIENT, "chrome"));

        assertEquals(HttpStatus.TOO_MANY_REQUESTS, ex.getStatusCode());
    }

    @Test
    void shouldRecognizeDemoUserByEmailIgnoringCase() {
        User other = demoUser();
        other.setEmail("someone@anveshak.test");

        assertTrue(service(true, "DEMO@anveshak.test", 10).isDemoUser(demoUser()));
        assertFalse(service(true, "demo@anveshak.test", 10).isDemoUser(other));
        assertFalse(service(true, null, 10).isDemoUser(demoUser()));
    }
}
