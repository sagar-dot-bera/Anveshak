package com.anveshak;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;

import java.time.Instant;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

import com.anveshak.config.DemoSessionGuardFilter;
import com.anveshak.service.JwtService;

public class DemoSessionGuardFilterTest {

    private final DemoSessionGuardFilter filter = new DemoSessionGuardFilter();

    @AfterEach
    void clearContext() {
        SecurityContextHolder.clearContext();
    }

    private void authenticate(boolean demo) {
        Jwt.Builder jwt = Jwt.withTokenValue("token")
                .header("alg", "RS256")
                .subject("user-id")
                .issuedAt(Instant.now())
                .expiresAt(Instant.now().plusSeconds(60));
        if (demo) {
            jwt.claim(JwtService.DEMO_CLAIM, true);
        }
        SecurityContextHolder.getContext().setAuthentication(new JwtAuthenticationToken(jwt.build()));
    }

    /** Returns the response status, or 0 when the request reached the rest of the chain. */
    private int run(String method, String path) throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest(method, path);
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockFilterChain chain = new MockFilterChain();

        filter.doFilter(request, response, chain);

        if (chain.getRequest() != null) {
            return 0;
        }
        return response.getStatus();
    }

    @Test
    void demoSessionCanRead() throws Exception {
        authenticate(true);
        assertEquals(0, run("GET", "/papers"));
    }

    @Test
    void demoSessionCanUseProductFeatures() throws Exception {
        authenticate(true);
        assertEquals(0, run("POST", "/papers/search/global"));
        assertEquals(0, run("POST", "/papers/compare"));
        assertEquals(0, run("POST", "/chat-sessions"));
        assertEquals(0, run("POST", "/chat-sessions/3f1c/messages"));
        assertEquals(0, run("POST", "/roadmaps/generate"));
    }

    @Test
    void demoSessionCannotChangeLibraryOrAccount() throws Exception {
        authenticate(true);
        assertEquals(403, run("POST", "/papers/upload/init"));
        assertEquals(403, run("DELETE", "/papers/3f1c"));
        assertEquals(403, run("POST", "/collections"));
        assertEquals(403, run("DELETE", "/chat-sessions/3f1c"));
        assertEquals(403, run("PATCH", "/users/me/password"));
        assertEquals(403, run("POST", "/auth/logout-all"));
    }

    @Test
    void refusalExplainsWhy() throws Exception {
        authenticate(true);
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/papers");
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilter(request, response, new MockFilterChain());

        assertEquals("application/json", response.getContentType());
        assertNotNull(response.getContentAsString());
        assertEquals(true, response.getContentAsString().contains("read-only demo account"));
    }

    @Test
    void regularSessionIsUnaffected() throws Exception {
        authenticate(false);
        assertEquals(0, run("DELETE", "/papers/3f1c"));
        assertEquals(0, run("PATCH", "/users/me/password"));
    }

    @Test
    void anonymousRequestIsUnaffected() throws Exception {
        assertNull(SecurityContextHolder.getContext().getAuthentication());
        assertEquals(0, run("POST", "/auth/demo"));
    }
}
