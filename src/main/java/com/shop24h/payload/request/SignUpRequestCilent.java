package com.shop24h.payload.request;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

public class SignUpRequestCilent {
    @NotBlank
    @Size(min = 3, max = 20)
    private String username;
  
  
    @NotBlank
    @Size(min = 6, max = 40)
    private String password;

    @NotBlank
    private String fullName;


    @NotBlank
    private String email;

    
    @NotBlank
    private String phoneNumber;

    
    private String secretQuestion;


    private String secretAsnwer;




    


    public SignUpRequestCilent() {
    }


    


    public SignUpRequestCilent(@NotBlank @Size(min = 3, max = 20) String username,
            @NotBlank @Size(min = 6, max = 40) String password, @NotBlank String fullName, @NotBlank String email,
            @NotBlank String phoneNumber, String secretQuestion, String secretAsnwer) {
        this.username = username;
        this.password = password;
        this.fullName = fullName;
        this.email = email;
        this.phoneNumber = phoneNumber;
        this.secretQuestion = secretQuestion;
        this.secretAsnwer = secretAsnwer;
    }





    public String getUsername() {
        return username;
    }


    public void setUsername(String username) {
        this.username = username;
    }


    public String getPassword() {
        return password;
    }


    public void setPassword(String password) {
        this.password = password;
    }


    public String getFullName() {
        return fullName;
    }


    public void setFullName(String fullName) {
        this.fullName = fullName;
    }


    public String getEmail() {
        return email;
    }


    public void setEmail(String email) {
        this.email = email;
    }


    public String getPhoneNumber() {
        return phoneNumber;
    }


    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }





    public String getSecretQuestion() {
        return secretQuestion;
    }





    public void setSecretQuestion(String secretQuestion) {
        this.secretQuestion = secretQuestion;
    }





    public String getSecretAsnwer() {
        return secretAsnwer;
    }





    public void setSecretAsnwer(String secretAsnwer) {
        this.secretAsnwer = secretAsnwer;
    }


    
  
  
    
}
