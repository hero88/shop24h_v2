package com.shop24h.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import com.shop24h.model.ProductLine;
import com.shop24h.repository.ProductLineRepository;

@RestController
@CrossOrigin
public class ProductLineController {

    @Autowired
    ProductLineRepository productLineRepository;

    @GetMapping("/productLines")
    public List<ProductLine> getAllProductLine(){
        return productLineRepository.findAll();
        
    }

    @GetMapping("/productLine/{productLineId}")
    public ProductLine getProducLinetById(@PathVariable int productLineId){
        return productLineRepository.findById(productLineId).get();
        
    }

    
}
