package com.shop24h.repository;

import javax.transaction.Transactional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.shop24h.model.OrderDetail;

public interface OrderDetailRepository extends JpaRepository<OrderDetail, Long>{
    @Transactional
    @Modifying
    @Query(value = "DELETE FROM order_details WHERE order_id = :orderId", nativeQuery = true)
    void deleteAllByOrderId(@Param("orderId") int orderId);


    // void deleteByOrderId(int orderId);
    
}
