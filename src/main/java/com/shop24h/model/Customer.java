package com.shop24h.model;
import java.util.List;
import java.util.Set;

import javax.persistence.*;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;

@Entity
@Table(name="customers")
public class Customer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    private String fullName;

    private String phoneNumber;
    
    private String email;

    private int salesEmployeeNumber;


    @OneToMany(cascade = CascadeType.ALL, mappedBy = "customer")
    @JsonManagedReference("customer_order")
    private List<Order> orders;

    @OneToMany(cascade = CascadeType.ALL, mappedBy = "customer")
    @JsonManagedReference("customer_payment")
    private List<Payment> payments;

    @OneToMany(cascade = CascadeType.ALL, mappedBy = "customer")
    @JsonIgnore
    private List<Rating> ratings;

    @OneToMany(cascade = CascadeType.ALL, mappedBy = "customer")
    @JsonIgnore
    private List<Comment> comments;

    @OneToOne(cascade = CascadeType.ALL, optional = true)
    @JoinColumn(name = "user_id", referencedColumnName = "id", nullable = true)    
    private User user;

    public Customer() {
    }    

    public Customer(int id, String fullName, String phoneNumber, String email, int salesEmployeeNumber,
            List<Order> orders, List<Payment> payments, List<Rating> ratings, List<Comment> comments, User user) {
        this.id = id;
        this.fullName = fullName;
        this.phoneNumber = phoneNumber;
        this.email = email;
        this.salesEmployeeNumber = salesEmployeeNumber;
        this.orders = orders;
        this.payments = payments;
        this.ratings = ratings;
        this.comments = comments;
        this.user = user;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public int getSalesEmployeeNumber() {
        return salesEmployeeNumber;
    }

    public void setSalesEmployeeNumber(int salesEmployeeNumber) {
        this.salesEmployeeNumber = salesEmployeeNumber;
    }

    public List<Order> getOrders() {
        return orders;
    }

    public void setOrders(List<Order> orders) {
        this.orders = orders;
    }

    public List<Payment> getPayments() {
        return payments;
    }

    public void setPayments(List<Payment> payments) {
        this.payments = payments;
    }

    public List<Rating> getRatings() {
        return ratings;
    }

    public void setRatings(List<Rating> ratings) {
        this.ratings = ratings;
    }




    public List<Comment> getComments() {
        return comments;
    }




    public void setComments(List<Comment> comments) {
        this.comments = comments;
    }




    public User getUser() {
        return user;
    }




    public void setUser(User user) {
        this.user = user;
    }


    public Set<Role> getRole(){
        if(user != null){     
        return user.getRoles();
        }
        return null;
    }

    public long getTotalPriceCustomer(){
        long vPrice = 0;
        if(this.orders != null){
            for (Order order : this.orders){
                vPrice += order.getTotalPriceOrder();
            }
        }
        return vPrice;
    }

    //Tổng Order
    public int getTotalOrder(){
        if(this.orders != null){
            return this.orders.size();
        }
        return 0;
    }



    public int getCountOrderCustomer() {
        if (this.orders != null) {
            return this.orders.size();
        } else {
            return 0;
        }
    }




    
    
    
}
