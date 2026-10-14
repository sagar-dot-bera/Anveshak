package com.anveshak.controller;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.anveshak.service.GlobalPaperService;

/**
 * Admin trigger for the arXiv harvest. There are no user roles, so the
 * endpoint is guarded by a shared secret ({@code ADMIN_HARVEST_TOKEN}) sent in
 * the {@code X-Admin-Token} header. With no secret configured the endpoint is
 * disabled.
 */
@RestController
@RequestMapping("/api/admin/harvest")
public class HarvestController {

    static final String ADMIN_TOKEN_HEADER = "X-Admin-Token";

    private final GlobalPaperService globalPaperService;
    private final String harvestToken;

    public HarvestController(GlobalPaperService globalPaperService,
            @Value("${admin.harvest-token:}") String harvestToken) {
        this.globalPaperService = globalPaperService;
        this.harvestToken = harvestToken;
    }

    @PostMapping("/arxiv")
    public ResponseEntity<Void> harvestArxivPapers(
            @RequestHeader(value = ADMIN_TOKEN_HEADER, required = false) String providedToken) {
        if (harvestToken == null || harvestToken.isBlank()) {
            return ResponseEntity.notFound().build();
        }
        if (providedToken == null || !MessageDigest.isEqual(
                harvestToken.getBytes(StandardCharsets.UTF_8),
                providedToken.getBytes(StandardCharsets.UTF_8))) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        if (!globalPaperService.startHarvest()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
        return ResponseEntity.accepted().build();
    }
}
