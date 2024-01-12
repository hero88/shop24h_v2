package com.shop24h.repository;

import java.util.Set;

import org.springframework.data.jpa.repository.JpaRepository;

import com.shop24h.model.District;

public interface DistrictRepository extends JpaRepository<District, Integer>{
    Set<District> findByProvinceId(int provinceId);
    
}
