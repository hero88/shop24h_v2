package com.shop24h.model;

import java.util.List;
import java.util.Set;

import javax.persistence.*;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;

@Entity
@Table(name ="province")
public class Province {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    private String code;
   
    private String name;

    
    @OneToMany(mappedBy = "province", cascade = CascadeType.ALL)
    @JsonIgnore
    private Set<District> districts;

    @OneToMany(mappedBy = "province", cascade = CascadeType.ALL)
    @JsonManagedReference("province_order")
    private List<Order> oders;


    public Province() {
    }

    
    public Province(int id, String code, String name, Set<District> districts, List<Order> oders) {
        this.id = id;
        this.code = code;
        this.name = name;
        this.districts = districts;
        this.oders = oders;
    }

    


    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Set<District> getDistricts() {
        return districts;
    }

    public void setDistricts(Set<District> districts) {
        this.districts = districts;
    }


    public List<Order> getOders() {
        return oders;
    }


    public void setOders(List<Order> oders) {
        this.oders = oders;
    }    
}
