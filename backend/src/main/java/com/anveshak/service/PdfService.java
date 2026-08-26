package com.anveshak.service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.anveshak.DTOs.PaperChunkDTO;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class PdfService {
    public String extractText(MultipartFile pdfFile) throws IOException {
        if (pdfFile == null || pdfFile.isEmpty()) return "";
        try (PDDocument document = Loader.loadPDF(pdfFile.getBytes())) {
            PDFTextStripper stripper = new PDFTextStripper();
            return stripper.getText(document);
        } catch (Exception e) {
            log.error("Error extracting text from PDF: {}", e.getMessage());
            return "";
        }
    }

    public List<PaperChunkDTO> extractChucks(MultipartFile pdfFile, int chunkSize) throws IOException {
        List<PaperChunkDTO> chunks = new ArrayList<>();
        if (pdfFile == null || pdfFile.isEmpty()) return chunks;

        try (PDDocument document = Loader.loadPDF(pdfFile.getBytes())) {
            PDFTextStripper stripper = new PDFTextStripper();

            for (int page = 1; page <= document.getNumberOfPages(); page++) {
                stripper.setStartPage(page);
                stripper.setEndPage(page);

                String pageText = stripper.getText(document);
                if (pageText == null || pageText.isBlank()) continue;

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
        } catch (Exception e) {
            log.error("Error extracting chunks from PDF: {}", e.getMessage());
        }
        return chunks;
    }
}