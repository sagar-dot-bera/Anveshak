package com.anveshak.service;

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

@Service
public class SupabaseFileStoreService implements FileStorageService {

    @Value("$(supabase.url)")
    private String supabaseUrl;

    @Value("$(supabase.service-role-key")
    private String serviceRoleKey;

    @Value("$(supabse.bucket-name")
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

        HttpEntity<byte[]> request = new HttpEntity<>(file.getBytes(), headers);

        String url = supabaseUrl + "/storage/v1/object" + bucketName + "/papers/" + file.getName();

        restTemplate.exchange(url, HttpMethod.POST, request, String.class);

        return "/papers/" + file.getName();

    }

    @Override
    public InputStream download(String storageKey) {

        String url = supabaseUrl + "/storage/v1/object" + bucketName + storageKey;

        return restTemplate.execute(url, HttpMethod.GET, request -> {
            request.getHeaders().setBearerAuth(serviceRoleKey);
            request.getHeaders().set("apiKey", serviceRoleKey);
        }, response -> response.getBody());
    }

    @Override
    public void delete(String storageKey) {
        String url = supabaseUrl + "/storage/v1/object" + bucketName + storageKey;
        HttpHeaders httpHeaders = new HttpHeaders();

        httpHeaders.setBearerAuth(serviceRoleKey);
        httpHeaders.set("apiKey", serviceRoleKey);

        HttpEntity<Void> request = new HttpEntity<>(httpHeaders);

        restTemplate.exchange(url, HttpMethod.DELETE, request, Void.class);
    }

}
