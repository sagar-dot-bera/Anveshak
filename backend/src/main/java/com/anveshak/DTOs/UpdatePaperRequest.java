package com.anveshak.DTOs;

public record UpdatePaperRequest(
        String title,
        String abstractText,
        String[] authors,
        Integer publicationYear,
        String[] keywords) {

}