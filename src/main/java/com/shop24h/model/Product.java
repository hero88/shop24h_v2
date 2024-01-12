package com.shop24h.model;

import java.util.List;

import javax.persistence.*;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name="products")
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    
    @Column(unique = true)
    private String productCode;

    private String productName;

    private String productDescripttion;

    @ManyToOne
    @JsonBackReference("ProductLine_product")
    @JoinColumn(name="product_line_id")
    private ProductLine productLine;


    @ElementCollection
    private List<String> productImg;


    private String productVendor;

    private int quantityInStock;

    private long buyPrice;

    @OneToMany(cascade = CascadeType.ALL, mappedBy = "product")
	@JsonIgnore
	private List<OrderDetail> orderDetails;

    @OneToMany(cascade = CascadeType.ALL, mappedBy = "product")
    @JsonIgnore
    private List<Rating> ratings;



    public Product() {
    }

    public Product(int id, String productCode, String productName, String productDescripttion, ProductLine productLine,
            List<String> productImg, String productVendor, int quantityInStock, long buyPrice,
            List<OrderDetail> orderDetails, List<Rating> ratings) {
        this.id = id;
        this.productCode = productCode;
        this.productName = productName;
        this.productDescripttion = productDescripttion;
        this.productLine = productLine;
        this.productImg = productImg;
        this.productVendor = productVendor;
        this.quantityInStock = quantityInStock;
        this.buyPrice = buyPrice;
        this.orderDetails = orderDetails;
        this.ratings = ratings;
    }


    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getProductCode() {
        return productCode;
    }

    public void setProductCode(String productCode) {
        this.productCode = productCode;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public String getProductDescripttion() {
        return productDescripttion;
    }

    public void setProductDescripttion(String productDescripttion) {
        this.productDescripttion = productDescripttion;
    }

    public ProductLine getProductLine() {
        return productLine;
    }

    public void setProductLine(ProductLine productLine) {
        this.productLine = productLine;
    }


    public String getProductVendor() {
        return productVendor;
    }

    public void setProductVendor(String productVendor) {
        this.productVendor = productVendor;
    }

    public int getQuantityInStock() {
        return quantityInStock;
    }

    public void setQuantityInStock(int quantityInStock) {
        this.quantityInStock = quantityInStock;
    }

    public long getBuyPrice() {
        return buyPrice;
    }

    public void setBuyPrice(long buyPrice) {
        this.buyPrice = buyPrice;
    }

    public List<OrderDetail> getOrderDetails() {
        return orderDetails;
    }

    public void setOrderDetails(List<OrderDetail> orderDetails) {
        this.orderDetails = orderDetails;
    }




    public List<String> getProductImg() {
        return productImg;
    }




    public void setProductImg(List<String> productImg) {
        this.productImg = productImg;
    }


    public List<Rating> getRatings() {
        return ratings;
    }


    public void setRatings(List<Rating> ratings) {
        this.ratings = ratings;
    }



    public int getProductSold(){
        int vTotal = 0;
        if(this.orderDetails != null){
            for(OrderDetail orderDetail : orderDetails){
                vTotal += orderDetail.getQuantityOrder();
            }
        }
        return vTotal;
    }

        public float getAverageRating() {
        float totalRatingNumber = 0;
        if (ratings != null && !ratings.isEmpty()) { // Kiểm tra nếu ratings khác null và không rỗng
            for (Rating rating : ratings) {
                totalRatingNumber += rating.getRatingNumber();
            }
            return totalRatingNumber / ratings.size();
        } else {
            return totalRatingNumber;
        }
    }

    
    
    
}
