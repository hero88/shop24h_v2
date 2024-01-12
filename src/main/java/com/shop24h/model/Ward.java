package com.shop24h.model;
import java.util.List;

import javax.persistence.*;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;




@Entity
@Table(name="Ward")
public class Ward {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
  
    private String name;

    private String prefix;

    @ManyToOne
    @JsonIgnore
    private District district;

    @OneToMany(mappedBy = "ward", cascade = CascadeType.ALL)
    @JsonManagedReference("ward_order")
    private List<Order> oders;

    
    public Ward() {
    }
    
    
    public Ward(int id, String name, String prefix, District district, List<Order> oders) {
        this.id = id;
        this.name = name;
        this.prefix = prefix;
        this.district = district;
        this.oders = oders;
    }

    

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPrefix() {
        return prefix;
    }

    public void setPrefix(String prefix) {
        this.prefix = prefix;
    }

    public District getDistrict() {
        return district;
    }

    public void setDistrict(District district) {
        this.district = district;
    }


    public List<Order> getOders() {
        return oders;
    }


    public void setOders(List<Order> oders) {
        this.oders = oders;
    }

}
