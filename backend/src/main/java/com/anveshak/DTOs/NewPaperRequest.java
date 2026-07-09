package com.anveshak.DTOs;

public record NewPaperRequest(
        String title,
        String abstractText,
        String[] authors,
        Integer publicationYear,
        String[] keywords) {

}
