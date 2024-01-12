package com.shop24h.model;

import java.math.BigDecimal;
import java.util.Date;

import javax.persistence.*;

import com.fasterxml.jackson.annotation.JsonBackReference;

@Entity
@Table(name="payments")
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @ManyToOne
    @JsonBackReference("customer_payment")
    @JoinColumn(name="customer_id")
    private Customer customer;

    private String checkNumber;

    @Temporal(TemporalType.TIMESTAMP)
    private Date paymentDate;

    private BigDecimal ammount;

    public Payment() {
    }

    public Payment(int id, Customer customer, String checkNumber, Date paymentDate, BigDecimal ammount) {
        this.id = id;
        this.customer = customer;
        this.checkNumber = checkNumber;
        this.paymentDate = paymentDate;
        this.ammount = ammount;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public Customer getCustomer() {
        return customer;
    }

    public void setCustomer(Customer customer) {
        this.customer = customer;
    }

    public String getCheckNumber() {
        return checkNumber;
    }

    public void setCheckNumber(String checkNumber) {
        this.checkNumber = checkNumber;
    }

    public Date getPaymentDate() {
        return paymentDate;
    }

    public void setPaymentDate(Date paymentDate) {
        this.paymentDate = paymentDate;
    }

    public BigDecimal getAmmount() {
        return ammount;
    }

    public void setAmmount(BigDecimal ammount) {
        this.ammount = ammount;
    }

    
    
}
