package com.shop24h.service;

import org.springframework.web.multipart.MultipartFile;

public interface StorageFirebaseService {
    String uploadImage(MultipartFile file) throws Exception;

    byte[] downloadImage(String imageName); 

    void deleteImage(String imageName);
    
} 
    

