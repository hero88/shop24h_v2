package com.shop24h.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.shop24h.model.Province;
import com.shop24h.repository.ProvinceRepository;

@RestController
@CrossOrigin
public class ProvinceController {

    @Autowired
    ProvinceRepository provinceRepository;

    @GetMapping("/provinces")
    public List<Province> getAllProvince (){
        return provinceRepository.findAll();
    }
    
}
