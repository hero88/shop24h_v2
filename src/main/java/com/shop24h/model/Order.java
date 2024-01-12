package com.shop24h.model;

import java.util.Date;
import java.util.List;

import javax.persistence.*;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonManagedReference;

@Entity
@Table(name="orders")
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    
    @JsonFormat(pattern = "dd-MM-yyyy HH:mm:ss", timezone="Asia/Ho_Chi_Minh")
    private Date orderDate;

    @JsonFormat(pattern = "dd-MM-yyyy HH:mm:ss", timezone="Asia/Ho_Chi_Minh")
    private Date requiredDate;

    @JsonFormat(pattern = "dd-MM-yyyy HH:mm:ss", timezone="Asia/Ho_Chi_Minh")
    private Date shippedDate;

    private String status;

    private String comments;

    private String address;

    private String orderCode;

    @ManyToOne
    @JsonBackReference("customer_order")
    @JoinColumn(name="customer_id")
    private Customer customer;

    @OneToMany(cascade = CascadeType.ALL, mappedBy="order")
    @JsonManagedReference
	private List<OrderDetail> orderDetails;

    @ManyToOne
    @JsonBackReference("province_order")
    @JoinColumn(name="province_id")
    private Province province;

    @ManyToOne
    @JsonBackReference("district_order")
    @JoinColumn(name="district_id")
    private District district;

    @ManyToOne
    @JsonBackReference("ward_order")
    @JoinColumn(name="ward_id")
    private Ward ward;

    
    public Order() {
    }

    
    
    public Order(int id, Date orderDate, Date requiredDate, Date shippedDate, String status, String comments,
            String address, String orderCode, Customer customer, List<OrderDetail> orderDetails, Province province,
            District district, Ward ward) {
        this.id = id;
        this.orderDate = orderDate;
        this.requiredDate = requiredDate;
        this.shippedDate = shippedDate;
        this.status = status;
        this.comments = comments;
        this.address = address;
        this.orderCode = orderCode;
        this.customer = customer;
        this.orderDetails = orderDetails;
        this.province = province;
        this.district = district;
        this.ward = ward;
    }



    public Province getProvince() {
        return province;
    }

    public void setProvince(Province province) {
        this.province = province;
    }

    public District getDistrict() {
        return district;
    }

    public void setDistrict(District district) {
        this.district = district;
    }

    public Ward getWard() {
        return ward;
    }

    public void setWard(Ward ward) {
        this.ward = ward;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public Date getOrderDate() {
        return orderDate;
    }

    public void setOrderDate(Date orderDate) {
        this.orderDate = orderDate;
    }

    public Date getRequiredDate() {
        return requiredDate;
    }

    public void setRequiredDate(Date requiredDate) {
        this.requiredDate = requiredDate;
    }

    public Date getShippedDate() {
        return shippedDate;
    }

    public void setShippedDate(Date shippedDate) {
        this.shippedDate = shippedDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getComments() {
        return comments;
    }

    public void setComments(String comments) {
        this.comments = comments;
    }

    public Customer getCustomer() {
        return customer;
    }

    public void setCustomer(Customer customer) {
        this.customer = customer;
    }

    public List<OrderDetail> getOrderDetails() {
        return orderDetails;
    }

    public void setOrderDetails(List<OrderDetail> orderDetails) {
        this.orderDetails = orderDetails;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }
    
    public String getCustomerName(){
        return customer.getFullName();
    }

    
    public long getTotalPriceOrder(){
        long vPrice = 0;
       
        if (this.orderDetails != null) {
            for(OrderDetail orderDetail : this.orderDetails){
                vPrice += orderDetail.getPriceEach() * orderDetail.getQuantityOrder();
            }
        }        
        return vPrice;
    }

    public String getOrderCode() {
        return orderCode;
    }

    public void setOrderCode(String orderCode) {
        this.orderCode = orderCode;
    }

    public String getProvinceName() {
        return province.getName();
    }
    public String getDistrictName() {
        return district.getName();
    }
    public String getWardName() {
        return ward.getName();
    }

    public String getPhoneNumber(){
        return customer.getPhoneNumber();
    }

    
    public String getEmail(){
        return customer.getEmail();
    }
    
    public int getProvinceId(){
        return province.getId();
    }


    public int getDistrictId(){
        return district.getId();
    }


    public int getWardId(){
        return ward.getId();
    }

    
    
    
}
