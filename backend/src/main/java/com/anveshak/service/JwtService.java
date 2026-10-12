package com.anveshak.service;

import java.time.Instant;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;

@Service
public class JwtService {

    /** Claim marking a token as belonging to a read-only demo session. */
    public static final String DEMO_CLAIM = "demo";

    private final JwtEncoder jwtEncoder;
    private final JwtDecoder jwtDecoder;

    public JwtService(JwtEncoder jwtEncoder, JwtDecoder jwtDecoder) {
        this.jwtEncoder = jwtEncoder;
        this.jwtDecoder = jwtDecoder;
    }

    public String generateToken(String userId, String email, String username, long expiration) {
        return generateToken(userId, email, username, expiration, Map.of());
    }

    public String generateToken(String userId, String email, String username, long expiration,
            Map<String, Object> extraClaims) {
        Instant now = Instant.now();

        JwtClaimsSet.Builder builder = JwtClaimsSet.builder()
                .subject(userId)
                .claim("email", email)
                .claim("username", username)
                .issuedAt(now)
                .expiresAt(now.plusSeconds(expiration));
        extraClaims.forEach(builder::claim);
        JwtClaimsSet claims = builder.build();

        return jwtEncoder.encode(JwtEncoderParameters.from(claims)).getTokenValue();
    }

    public String extractEmailFromToken(String token) {
        return jwtDecoder.decode(token).getClaim("email").toString();
    }

    public String extractUserIdFromToken(String token) {
        return jwtDecoder.decode(token).getSubject();
    }

    public String extractUsernameFromToken(String token) {
        return jwtDecoder.decode(token).getClaim("username").toString();
    }

    public boolean validateToken(String token, UserDetails user) {
        try {
            String usernameFromToken = extractUsernameFromToken(token);
            return (usernameFromToken.equals(user.getUsername())) && !isTokenExpired(token);
        } catch (Exception ex) {
            return false;
        }
    }

    private boolean isTokenExpired(String token) {
        Instant expiresAt = jwtDecoder.decode(token).getExpiresAt();
        return expiresAt == null || expiresAt.isBefore(Instant.now());
    }
}
