package com.shop24h.model;


import java.util.List;

import javax.persistence.*;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name="order_details")
public class OrderDetail {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @ManyToOne
    @JsonIgnore
    @JoinColumn(name="product_id")
    private Product product;

    @ManyToOne
    @JsonBackReference
    @JoinColumn(name="order_id")
    private Order order;

    private int quantityOrder;

    private long priceEach;

    @OneToOne
    @JoinColumn(name="rating_id")
    private Rating rating;


    public OrderDetail() {
    }

    public OrderDetail(long id, Product product, Order order, int quantityOrder, long priceEach) {
        this.id = id;
        this.product = product;
        this.order = order;
        this.quantityOrder = quantityOrder;
        this.priceEach = priceEach;
    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }

    public Order getOrder() {
        return order;
    }

    public void setOrder(Order order) {
        this.order = order;
    }

    public int getQuantityOrder() {
        return quantityOrder;
    }

    public void setQuantityOrder(int quantityOrder) {
        this.quantityOrder = quantityOrder;
    }

    public long getPriceEach() {
        return priceEach;
    }

    public void setPriceEach(long priceEach) {
        this.priceEach = priceEach;
    }

    public int getProductId(){
        return product.getId();
    }

    public String getProductName(){
        return product.getProductName();
    }

    public String getFirstProductImg(){
        List<String> productImgList = product.getProductImg();
        if (productImgList != null && !productImgList.isEmpty()) {
            return productImgList.get(0);
        }
        return null;    
    }

    public Rating getRating() {
        return rating;
    }

    public void setRating(Rating rating) {
        this.rating = rating;
    }

    public String getOrderCode(){
        return order.getOrderCode();
    }

    


    
    
    

}
