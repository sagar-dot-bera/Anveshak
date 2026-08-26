package com.anveshak.service;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.http.HttpRequest;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class SupabaseFileStoreService implements FileStorageService {

    @Value("${supabase.url}")
    private String supabaseUrl;

    @Value("${supabase.service-role-key}")
    private String serviceRoleKey;

    @Value("${supabase.bucket-name}")
    private String bucketName;

    final RestTemplate restTemplate;

    public SupabaseFileStoreService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @Override
    public String upload(MultipartFile file) throws IOException {
        HttpHeaders headers = new HttpHeaders();

        headers.setBearerAuth(serviceRoleKey);
        headers.set("apiKey", serviceRoleKey);
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.set("x-upsert", "true");

        log.info("Uploading file to Supabase storage: {}", file.getOriginalFilename());

        HttpEntity<byte[]> request = new HttpEntity<>(file.getBytes(), headers);

        log.info("Supabase URL: {}", supabaseUrl);
        log.info("Request: {}", request);

        String url = supabaseUrl + "/storage/v1/object/" + bucketName + "/papers/" + file.getOriginalFilename();
        log.info("Supabase URL: {}", url);
        ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, request, String.class);

        log.info("File uploaded to Supabase storage: {}", file.getOriginalFilename());
        log.info("Response: {}", response.getBody());
        log.info("Response status code: {}", response.getStatusCode());
        return "papers/" + file.getOriginalFilename();

    }

    @Override
    public InputStream download(String storageKey) {

        String url = supabaseUrl + "/storage/v1/object/" + bucketName + "/" + storageKey;

        log.info("Supabase URL: {}", url);

        byte[] bytes = restTemplate.execute(
                url,
                HttpMethod.GET,
                request -> {
                    request.getHeaders().setBearerAuth(serviceRoleKey);
                    request.getHeaders().set("apikey", serviceRoleKey);
                },
                response -> {
                    log.info("Status: {}", response.getStatusCode());
                    log.info("Content-Type: {}", response.getHeaders().getContentType());
                    log.info("Content-Length: {}", response.getHeaders().getContentLength());

                    return response.getBody().readAllBytes();
                });

        return new ByteArrayInputStream(bytes);
    }

    @Override
    public void delete(String storageKey) {
        String url = supabaseUrl + "/storage/v1/object/" + bucketName + storageKey;
        HttpHeaders httpHeaders = new HttpHeaders();

        httpHeaders.setBearerAuth(serviceRoleKey);
        httpHeaders.set("apiKey", serviceRoleKey);

        HttpEntity<Void> request = new HttpEntity<>(httpHeaders);

        restTemplate.exchange(url, HttpMethod.DELETE, request, Void.class);
    }

}
