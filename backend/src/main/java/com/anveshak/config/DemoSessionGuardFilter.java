package com.anveshak.config;

import java.io.IOException;
import java.time.Instant;
import java.util.List;
import java.util.Set;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.PathContainer;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.pattern.PathPattern;
import org.springframework.web.util.pattern.PathPatternParser;

import com.anveshak.service.JwtService;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * Keeps demo sessions read-only. Reads always pass; writes pass only when they
 * exercise the product (search, chat, compare, reviews, roadmaps) rather than
 * change the shared library or the account. Anything not listed is refused, so
 * new write endpoints stay closed to demo sessions by default.
 */
public class DemoSessionGuardFilter extends OncePerRequestFilter {

    private static final Set<String> READ_METHODS = Set.of("GET", "HEAD", "OPTIONS");

    private static final List<PathPattern> ALLOWED_DEMO_WRITES = List.of(
            "/papers/search/local",
            "/papers/search/global",
            "/papers/compare",
            "/papers/literature-review",
            "/roadmaps/generate",
            "/chat-sessions",
            "/chat-sessions/{sessionId}/messages",
            "/auth/refresh",
            "/auth/logout")
            .stream()
            .map(PathPatternParser.defaultInstance::parse)
            .toList();

    private static final String REFUSAL_MESSAGE = "This is a read-only demo account. Create an account to upload papers or change settings.";

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        if (isDemoSession() && !isAllowedForDemo(request)) {
            int status = HttpStatus.FORBIDDEN.value();
            response.setStatus(status);
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.getWriter().write("{\"status\":" + status
                    + ",\"error\":\"Demo account is read-only\",\"msg\":\"" + REFUSAL_MESSAGE
                    + "\",\"timestamp\":\"" + Instant.now() + "\"}");
            return;
        }
        filterChain.doFilter(request, response);
    }

    private boolean isDemoSession() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication instanceof JwtAuthenticationToken jwtAuthentication
                && Boolean.TRUE.equals(jwtAuthentication.getToken().getClaimAsBoolean(JwtService.DEMO_CLAIM));
    }

    private boolean isAllowedForDemo(HttpServletRequest request) {
        if (READ_METHODS.contains(request.getMethod())) {
            return true;
        }
        if (!"POST".equals(request.getMethod())) {
            return false;
        }
        String path = request.getRequestURI().substring(request.getContextPath().length());
        PathContainer pathContainer = PathContainer.parsePath(path);
        return ALLOWED_DEMO_WRITES.stream().anyMatch(pattern -> pattern.matches(pathContainer));
    }
}
