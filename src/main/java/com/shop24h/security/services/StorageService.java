package com.shop24h.security.services;

import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.shop24h.error.StorageException;
import java.nio.file.*;



@Service
public class StorageService {

    private final String uploadPath = "upload";



     public void store(String filename, MultipartFile file) {
        try {
            Path path = Paths.get(uploadPath);
            String fileExtension = filename.substring(filename.lastIndexOf(".") + 1);
        
            if (file.isEmpty()) {
                throw new StorageException("Failed to store empty file.");
            }

            if (!isAllowedExtension(fileExtension)) {
                throw new StorageException("Only images are accepted.");
            }
            
            if (!Files.exists(path)) {
                Files.createDirectories(path);
            }
            Path destinationFile = path.resolve(Paths.get(filename)).normalize().toAbsolutePath();
            if (!destinationFile.getParent().equals(path.toAbsolutePath())) {
                throw new StorageException("Cannot store file outside current directory.");
            }
            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, destinationFile, StandardCopyOption.REPLACE_EXISTING);
            }
        } catch (IOException e) {
            throw new StorageException("Failed to store file.", e);
        }
    }


    private boolean isAllowedExtension(String fileExtension) {
        // Danh sách các phần mở rộng file cho phép (ví dụ: jpg, png)
        String allowedExtensions = "jpg,png";
        return allowedExtensions.contains(fileExtension.toLowerCase());
    }


     public Resource loadAsResource(String filename) {
        try {
            Path path = Paths.get(uploadPath);
            Path file = path.resolve(filename);
            Resource resource = new UrlResource(file.toUri());
            if (resource.exists() || resource.isReadable()) {
                return resource;
            } else {
                throw new StorageException("Could not read file: " + filename);

            }
        } catch (MalformedURLException e) {
            throw new StorageException("Could not read file: " + filename, e);
        }
    }



    
}
