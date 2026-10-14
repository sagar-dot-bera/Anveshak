package com.anveshak;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.net.InetAddress;
import java.time.Duration;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.anveshak.DTOs.RefreshTokenRequest;
import com.anveshak.Exception.RefreshTokenNotFoundException;
import com.anveshak.Helper.HashUtil;
import com.anveshak.model.RefreshToken;
import com.anveshak.model.User;
import com.anveshak.repository.RefreshTokenRepository;
import com.anveshak.service.RefreshTokenService;
import com.anveshak.service.UserService;

@ExtendWith(MockitoExtension.class)
public class RefreshTokenServiceTest {

    @Mock
    RefreshTokenRepository refreshTokenRepository;

    @Mock
    UserService userService;

    @InjectMocks
    RefreshTokenService refreshTokenService;

    private static RefreshToken storedToken(Instant expiresAt) {
        RefreshToken token = new RefreshToken();
        token.setId(UUID.randomUUID());
        token.setToken(HashUtil.hash("raw-refresh"));
        token.setExpiresAt(expiresAt);
        token.setRevoked(false);
        return token;
    }

    @Test
    void shouldStoreHashAndExpireAfterGivenTtl() {
        when(refreshTokenRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        Instant before = Instant.now();
        refreshTokenService.createRefreshToken("raw-refresh", new User(), InetAddress.getLoopbackAddress(),
                "chrome", 3600);

        ArgumentCaptor<RefreshToken> saved = ArgumentCaptor.forClass(RefreshToken.class);
        verify(refreshTokenRepository).save(saved.capture());
        assertEquals(HashUtil.hash("raw-refresh"), saved.getValue().getToken());
        Duration ttl = Duration.between(before, saved.getValue().getExpiresAt());
        assertTrue(ttl.toSeconds() >= 3599 && ttl.toSeconds() <= 3601, "ttl was " + ttl);
    }

    @Test
    void shouldLookUpRefreshTokenByHash() {
        RefreshToken stored = storedToken(Instant.now().plusSeconds(60));
        when(refreshTokenRepository.findByTokenAndRevokedFalse(HashUtil.hash("raw-refresh")))
                .thenReturn(Optional.of(stored));

        assertSame(stored, refreshTokenService.getValidRefreshToken("raw-refresh"));
    }

    @Test
    void shouldRejectExpiredRefreshToken() {
        when(refreshTokenRepository.findByTokenAndRevokedFalse(HashUtil.hash("raw-refresh")))
                .thenReturn(Optional.of(storedToken(Instant.now().minusSeconds(1))));

        assertThrows(RefreshTokenNotFoundException.class,
                () -> refreshTokenService.getValidRefreshToken("raw-refresh"));
    }

    @Test
    void shouldNotPutRawTokenInErrorMessage() {
        when(refreshTokenRepository.findByTokenAndRevokedFalse(any())).thenReturn(Optional.empty());

        RefreshTokenNotFoundException ex = assertThrows(RefreshTokenNotFoundException.class,
                () -> refreshTokenService.getValidRefreshToken("raw-refresh"));
        assertFalse(ex.getMessage().contains("raw-refresh"));
    }

    @Test
    void shouldTreatExpiredTokenAsInvalid() {
        when(refreshTokenRepository.findByTokenAndRevokedFalse(HashUtil.hash("raw-refresh")))
                .thenReturn(Optional.of(storedToken(Instant.now().minusSeconds(1))));

        assertFalse(refreshTokenService.isRefreshTokenValid(new RefreshTokenRequest("raw-refresh", null)));
    }
}
