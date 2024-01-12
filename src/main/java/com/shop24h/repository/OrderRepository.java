package com.shop24h.repository;

import java.util.List;

import javax.transaction.Transactional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Date;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.shop24h.model.Order;

public interface OrderRepository extends JpaRepository<Order, Integer>{

    List<Order> findByCustomerPhoneNumber(String phoneNumber);
    
    @Query(value = "SELECT * FROM orders WHERE order_date BETWEEN :startDate AND :endDate", nativeQuery = true)    
    List<Order> findOrdersBetweenDates(@Param("startDate") Date startDate, @Param("endDate") Date endDate);
    

    //Tính Tổng Order theo Ngày
    @Query(value= "SELECT DATE(order_date) AS orderDate, SUM(order_details.price_each * order_details.quantity_order) AS totalPriceOrder FROM orders INNER JOIN order_details ON orders.id = order_details.order_id WHERE DATE(order_date) BETWEEN :startDate AND :endDate GROUP BY DATE(order_date)", nativeQuery = true)
    List<TotalPriceOrderByDate> findTotalPriceOrderByDate(@Param("startDate") Date startDate, @Param("endDate") Date endDate);

    public static interface TotalPriceOrderByDate {
        @JsonFormat(pattern = "dd-MM-yyyy", timezone="Asia/Ho_Chi_Minh")
        Date getOrderDate();
        long getTotalPriceOrder();
    }

    //Tính Tổng Order theo Tháng
    @Query(value = "SELECT DATE_FORMAT(order_date, '%Y-%m') AS orderMonth, SUM(order_details.price_each * order_details.quantity_order) AS totalPriceOrder FROM orders INNER JOIN order_details ON orders.id = order_details.order_id WHERE DATE_FORMAT(order_date, '%Y-%m') BETWEEN :startMonth AND :endMonth GROUP BY DATE_FORMAT(order_date, '%Y-%m')", nativeQuery=true)
    List<TotalPriceOrderByMonth> findTotalPriceOrderByMonth(@Param("startMonth") Date startMonth, @Param("endMonth") Date endMonth);
  
    public static interface TotalPriceOrderByMonth {
        String getOrderMonth();
        long getTotalPriceOrder();
    }

    //Tính Tổng Order theo Tuần
    @Query(value = "SELECT WEEK(order_date, 1) AS orderWeek, SUM(order_details.price_each * order_details.quantity_order) AS totalPriceOrder FROM orders INNER JOIN order_details ON orders.id = order_details.order_id WHERE  WEEK(order_date, 1) BETWEEN :startWeek AND :endWeek GROUP BY WEEK(order_date, 1)", nativeQuery=true)
    List<TotalPriceOrderByWeek> findTotalPriceOrderByWeek(@Param("startWeek") String startWeek, @Param("endWeek") String endWeek);
  
    public static interface TotalPriceOrderByWeek {
        String getOrderWeek();
        long getTotalPriceOrder();
    }

    

    //Cập nhật trạng thái Order
    @Transactional
    @Modifying
    @Query(value = "UPDATE orders SET status = :paramStatus WHERE id  = :paramId", nativeQuery = true)
    	int updateStatus(@Param("paramStatus") String paramStatus, @Param("paramId") int paramId);



}
