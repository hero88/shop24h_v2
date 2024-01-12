package com.shop24h.model;

import java.util.List;

import javax.persistence.*;

import com.fasterxml.jackson.annotation.JsonManagedReference;

@Entity
@Table(name="product_lines")
public class ProductLine {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    
    private String productLineName;

    private String productLineCode;

    @OneToMany(cascade = CascadeType.ALL, mappedBy = "productLine")
    @JsonManagedReference("ProductLine_product")  
    private List<Product> products;


    public ProductLine() {
    }


    public ProductLine(int id, String productLineName, String productLineCode, List<Product> products) {
        this.id = id;
        this.productLineName = productLineName;
        this.productLineCode = productLineCode;
        this.products = products;
    }


    public int getId() {
        return id;
    }


    public void setId(int id) {
        this.id = id;
    }


    public String getProductLineName() {
        return productLineName;
    }


    public void setProductLineName(String productLineName) {
        this.productLineName = productLineName;
    }


    public String getProductLineCode() {
        return productLineCode;
    }


    public void setProductLineCode(String productLineCode) {
        this.productLineCode = productLineCode;
    }


    public List<Product> getProducts() {
        return products;
    }


    public void setProducts(List<Product> products) {
        this.products = products;
    }

    

        
     
    
   
}
