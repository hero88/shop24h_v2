package com.shop24h.model;

import java.util.Date;
import java.util.Set;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name="comments")
public class Comment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    private String content;

    @JsonFormat(pattern = "dd-MM-yyyy HH:mm:ss", timezone="Asia/Ho_Chi_Minh") 
    private Date creatDate;


    @ManyToOne
    @JsonIgnore
    private Customer customer;

    @ManyToOne 
    @JsonBackReference
    private Rating rating;

    

    public Comment() {
    }

    public Comment(long id, String content, Date creatDate, Customer customer, Rating rating) {
        this.id = id;
        this.content = content;
        this.creatDate = creatDate;
        this.customer = customer;
        this.rating = rating;
    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public Date getCreatDate() {
        return creatDate;
    }

    public void setCreatDate(Date creatDate) {
        this.creatDate = creatDate;
    }

    public Customer getCustomer() {
        return customer;
    }

    public void setCustomer(Customer customer) {
        this.customer = customer;
    }

    public Rating getRating() {
        return rating;
    }

    public void setRating(Rating rating) {
        this.rating = rating;
    }

    public String getCustomerName(){
        return customer.getFullName();
    }

    
    public Set<Role> getRoleCustomer(){
        return customer.getRole();
    }
    

    
}
