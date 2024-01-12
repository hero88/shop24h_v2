package com.shop24h.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.shop24h.model.Rating;

public interface RatingRepository extends JpaRepository<Rating, Long>{

    Optional<List<Rating>> findByProductProductName(String productName);


    
}
