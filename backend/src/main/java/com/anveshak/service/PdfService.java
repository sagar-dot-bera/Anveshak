package com.anveshak.service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import com.anveshak.DTOs.PaperChunkDTO;

import jakarta.mail.Multipart;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

class PdfService {
    public String extractText(MultipartFile pdfFile) throws IOException {
        try (PDDocument document = Loader.loadPDF(pdfFile.getBytes())) {

            PDFTextStripper stripper = new PDFTextStripper();

            return stripper.getText(document);
        }
    }

    public List<PaperChunkDTO> extractChucks(MultipartFile pdfFile, int chunkSize) throws IOException {
        PDDocument document = Loader.loadPDF(pdfFile.getBytes());

        PDFTextStripper stripper = new PDFTextStripper();
        List<PaperChunkDTO> chunks = new ArrayList<>();

        for (int page = 1; page <= document.getNumberOfPages(); page++) {
            stripper.setStartPage(page);
            stripper.setEndPage(page);

            String pageText = stripper.getText(document);

            for (int i = 0; i < pageText.length(); i += chunkSize) {
                int end = Math.min(i + chunkSize, pageText.length());
                String chunkContent = pageText.substring(i, end);

                PaperChunkDTO chunk = new PaperChunkDTO(
                        chunkContent,
                        page,
                        i / chunkSize

                );

                chunks.add(chunk);
            }

        }
        return chunks;
    }
}