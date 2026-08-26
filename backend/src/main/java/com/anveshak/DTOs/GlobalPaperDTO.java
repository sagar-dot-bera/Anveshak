package com.anveshak.DTOs;

import java.time.LocalDate;

import java.util.List;

import lombok.Data;

@Data
public class GlobalPaperDTO {
        private String paperId;
        private LocalDate created;
        private LocalDate updated;
        private String title;
        private String abstractText;
        private String categories;
        private String license;
        private String doi;
        private String category;
        private String authors;
        private String paperUrl;
        private String pdfUrl;

}