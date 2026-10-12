package com.anveshak.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Settings for the public demo session issued by {@code POST /auth/demo}.
 *
 * @param enabled              whether demo sessions can be started at all
 * @param email                email of the existing, seeded account that demo sessions sign into
 * @param maxLoginsPerMinute   demo sessions a single client IP may start per minute
 */
@ConfigurationProperties(prefix = "demo")
public record DemoProperties(
        boolean enabled,
        String email,
        int maxLoginsPerMinute) {
}
