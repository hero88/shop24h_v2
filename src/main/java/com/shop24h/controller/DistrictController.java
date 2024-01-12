package com.shop24h.controller;

import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import com.shop24h.model.District;
import com.shop24h.repository.DistrictRepository;

@RestController
@CrossOrigin
public class DistrictController {

    @Autowired
    DistrictRepository districtRepository;

    @GetMapping("/districts/{provinceId}")
    public Set<District> getDistrictByProvinceId(@PathVariable int provinceId){
        return districtRepository.findByProvinceId(provinceId);
    }
    
}
