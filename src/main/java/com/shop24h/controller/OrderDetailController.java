package com.shop24h.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.shop24h.model.OrderDetail;
import com.shop24h.repository.OrderDetailRepository;
import com.shop24h.repository.OrderRepository;
import com.shop24h.repository.ProductRepository;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;


@RestController
@CrossOrigin
public class OrderDetailController {

    @Autowired
    OrderDetailRepository orderDetailRepository;

    @Autowired
    OrderRepository orderRepository;

    @Autowired
    ProductRepository productRepository;


    @PostMapping("/orderDetail/product/{productId}/order/{orderId}")
    public ResponseEntity<Object> createOrderDetail(@RequestBody OrderDetail orderDetail, @PathVariable int productId, @PathVariable int orderId){
        try {
            orderDetail.setOrder(orderRepository.findById(orderId).get());
            orderDetail.setProduct(productRepository.findById(productId).get());
            return new ResponseEntity<>(orderDetailRepository.save(orderDetail), HttpStatus.CREATED);       
        } catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @GetMapping("/orderDetailById/{orderDetailId}")
    public OrderDetail getOrderDetailById(@PathVariable long orderDetailId){
        return orderDetailRepository.findById(orderDetailId).get();
    }

    @PutMapping("/updateOrderDetail/order/{orderDetailId}")
    public ResponseEntity<Object> updateOrderDetail(@PathVariable long orderDetailId, @RequestBody OrderDetail orderDetail){
        try {
            OrderDetail orderDetailFound = orderDetailRepository.findById(orderDetailId).get();
            orderDetailFound.setQuantityOrder(orderDetail.getQuantityOrder());
            return ResponseEntity.ok(orderDetailRepository.save(orderDetailFound));
        } catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    @DeleteMapping("/deleteOrderDetail/{orderId}")
    public ResponseEntity<Object> deleteOrderDetail(@PathVariable int orderId){
        try {
            orderDetailRepository.deleteAllByOrderId(orderId);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    
}
