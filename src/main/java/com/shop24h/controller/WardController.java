package com.shop24h.controller;

import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import com.shop24h.model.Ward;
import com.shop24h.repository.WardRepository;

@RestController
@CrossOrigin
public class WardController {

    @Autowired
    WardRepository wardRepository;

    @GetMapping("/wards/{districtId}")
    public Set<Ward> getDistrictByProvinceId(@PathVariable int districtId){
        return wardRepository.findByDistrictId(districtId);
    }

    
}
