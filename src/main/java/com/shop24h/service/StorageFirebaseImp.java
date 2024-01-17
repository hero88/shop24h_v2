package com.shop24h.service;

import java.io.IOException;
import java.util.Objects;

import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

import com.google.firebase.cloud.StorageClient;

@Service
public class StorageFirebaseImp implements StorageFirebaseService {

    @Override
    public String uploadImage(@RequestParam("file") MultipartFile file)  {
        try {
            String fileName = generateFileName(file.getOriginalFilename());    
            StorageClient.getInstance().bucket().create(fileName, file.getBytes(), file.getContentType());
            return fileName;
            
        } catch (Exception e) {
            return e.getMessage();
        }    
        
    }

    @Override
    public byte[] downloadImage(String imageName) {
        try {
            return StorageClient.getInstance().bucket().get(imageName).getContent();
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    @Override
    public void deleteImage(String imageName) {
        try {
            StorageClient.getInstance().bucket().get(imageName).delete();
        } catch (Exception e) {
            e.printStackTrace();
        }
        
    }
    

    private String generateFileName(String originalFilename) {
        // Generate a unique file name (you may customize this according to your requirements)
        return System.currentTimeMillis() + "_" + Objects.requireNonNull(originalFilename).toLowerCase();
    }
    
    
    
}
