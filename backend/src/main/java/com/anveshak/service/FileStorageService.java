package com.anveshak.service;

import java.io.IOException;
import java.io.InputStream;

import org.springframework.web.multipart.MultipartFile;

public interface FileStorageService {

    String upload(MultipartFile file) throws IOException;

    InputStream download(String storageKey);

    void delete(String storageKey);
}
