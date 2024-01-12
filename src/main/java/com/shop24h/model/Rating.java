package com.shop24h.model;

import java.util.List;

import javax.persistence.*;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;

@Entity
@Table(name="rating")
public class Rating {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    private float ratingNumber;

    private String content;

    @ManyToOne
    @JsonIgnore
    private Customer customer;

    
    @ManyToOne
    @JsonIgnore
    private Product product;

    @OneToMany(mappedBy = "rating", cascade = CascadeType.ALL)    
    @JsonManagedReference
    private List<Comment> comments;


    @OneToOne(mappedBy = "rating", cascade = CascadeType.ALL)    
    @JsonIgnore
    private OrderDetail orderDetail;

    public Rating() {
    }
    

    public Rating(long id, float ratingNumber, String content, Customer customer, Product product,
            List<Comment> comments, OrderDetail orderDetail) {
        this.id = id;
        this.ratingNumber = ratingNumber;
        this.content = content;
        this.customer = customer;
        this.product = product;
        this.comments = comments;
        this.orderDetail = orderDetail;
    }


    public long getId() {
        return id;
    }


    public void setId(long id) {
        this.id = id;
    }


    public float getRatingNumber() {
        return ratingNumber;
    }


    public void setRatingNumber(float ratingNumber) {
        this.ratingNumber = ratingNumber;
    }


    public Customer getCustomer() {
        return customer;
    }


    public void setCustomer(Customer customer) {
        this.customer = customer;
    }


    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }

    public OrderDetail getOrderDetail() {
        return orderDetail;
    }

    public void setOrderDetail(OrderDetail orderDetail) {
        this.orderDetail = orderDetail;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }


    public List<Comment> getComments() {
        return comments;
    }


    public void setComments(List<Comment> comments) {
        this.comments = comments;
    }

    public String getCustomerName(){
        return customer.getFullName();
    }


    
    

    
}
