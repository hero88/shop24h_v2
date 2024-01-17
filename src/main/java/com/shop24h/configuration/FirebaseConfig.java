package com.shop24h.configuration;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;

import java.io.IOException;
import java.io.InputStream;

import javax.annotation.PostConstruct;



@Configuration
public class FirebaseConfig {

    
    @PostConstruct
    public static void initFirebase() {
        try {
            InputStream serviceAccount = new ClassPathResource("firebase-service.json").getInputStream();
            FirebaseOptions options = FirebaseOptions.builder()
                .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                .setStorageBucket("shop24h-de9f4.appspot.com")
                .build();

            FirebaseApp.initializeApp(options);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}


