package com.shop24h.payload.request;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

public class ProductRequest {
    private String productCode;

    private String productName;

    private List<MultipartFile> images;

    private String productDescripttion;

    private String productVendor;

    private int quantityInStock;

    private long buyPrice;

    public ProductRequest(String productCode, String productName, List<MultipartFile> images,
            String productDescripttion, String productVendor, int quantityInStock, long buyPrice) {
        this.productCode = productCode;
        this.productName = productName;
        this.images = images;
        this.productDescripttion = productDescripttion;
        this.productVendor = productVendor;
        this.quantityInStock = quantityInStock;
        this.buyPrice = buyPrice;
    }

    

    public ProductRequest() {
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



    public List<MultipartFile> getImages() {
        return images;
    }



    public void setImages(List<MultipartFile> images) {
        this.images = images;
    }

    

    





}
