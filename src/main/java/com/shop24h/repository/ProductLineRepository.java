package com.shop24h.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.shop24h.model.ProductLine;

public interface ProductLineRepository extends JpaRepository<ProductLine, Integer>{
    
}
