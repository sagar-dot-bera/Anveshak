package com.anveshak.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.anveshak.service.GlobalPaperService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/harvest")
@RequiredArgsConstructor
public class HarvestController {
    private final GlobalPaperService globalPaperService;

    @RequestMapping("/arxiv")
    public ResponseEntity<Void> harvestArxivPapers() {
        globalPaperService.harvestPaper();
        return ResponseEntity.accepted().build();
    }
}
