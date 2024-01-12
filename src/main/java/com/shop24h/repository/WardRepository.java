package com.shop24h.repository;

import java.util.Set;

import org.springframework.data.jpa.repository.JpaRepository;

import com.shop24h.model.Ward;

public interface WardRepository extends JpaRepository<Ward, Integer>{
    Set<Ward> findByDistrictId(int districtId);
    
}
