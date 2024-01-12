package com.shop24h.model;

import java.util.HashSet;
import java.util.Set;

import javax.persistence.*;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;


import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "users", 
    uniqueConstraints = { 
      @UniqueConstraint(columnNames = "username"),
    })

  public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 20)
    private String username;


    @NotBlank
    @Size(max = 120)
    private String password;


    private String secretQuestion;


    private String secretAsnwer;


    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(  name = "user_roles", 
          joinColumns = @JoinColumn(name = "user_id"), 
          inverseJoinColumns = @JoinColumn(name = "role_id"))
    private Set<Role> roles = new HashSet<>();

    
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
    @JsonIgnore    
    private Customer customer;


    public User() {
    }

    public User(Long id, @NotBlank @Size(max = 20) String username, @NotBlank @Size(max = 120) String password,
        String secretQuestion, String secretAsnwer, Set<Role> roles, Customer customer) {
      this.id = id;
      this.username = username;
      this.password = password;
      this.secretQuestion = secretQuestion;
      this.secretAsnwer = secretAsnwer;
      this.roles = roles;
      this.customer = customer;
    }

    public User(String username,  String password, Customer customer) {
      this.username = username;
      this.password = password;
      this.customer = customer;
    }



    public User(String username,  String password) {
      this.username = username;
      this.password = password;
    }


    public Long getId() {
      return id;
    }

    public void setId(Long id) {
      this.id = id;
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

    public Set<Role> getRoles() {
      return roles;
    }

    public void setRoles(Set<Role> roles) {
      this.roles = roles;
    }

    public Customer getCustomer() {
      return customer;
    }

    public void setCustomer(Customer customer) {
      this.customer = customer;
    }

    public String getFullNameCustomer() {
      return customer.getFullName();
    }

    public String getEmail() {
      return customer.getEmail();
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
