package com.anveshak.service;

import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.anveshak.model.User;

@Service
public class CurrentUserResolver {

    private final JwtService jwtService;
    private final UserService userService;

    public CurrentUserResolver(JwtService jwtService, UserService userService) {
        this.jwtService = jwtService;
        this.userService = userService;
    }

    public User resolveUser(String authorizationHeader) {
        String token = resolveBearerToken(authorizationHeader);
        String userId = jwtService.extractUserIdFromToken(token);
        return userService.fetchUserById(UUID.fromString(userId));
    }

    public String resolveBearerToken(String authorizationHeader) {
        if (authorizationHeader == null || authorizationHeader.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing Authorization header");
        }

        if (!authorizationHeader.startsWith("Bearer ")) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authorization header must use Bearer scheme");
        }

        return authorizationHeader.substring(7).trim();
    }
}
