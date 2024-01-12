package com.shop24h.controller;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.shop24h.model.OrderDetail;
import com.shop24h.model.Product;
import com.shop24h.model.Rating;
import com.shop24h.payload.request.RatingRequest;
import com.shop24h.repository.CustomerRepository;
import com.shop24h.repository.OrderDetailRepository;
import com.shop24h.repository.ProductRepository;
import com.shop24h.repository.RatingRepository;

@RestController
@CrossOrigin
public class RatingController {

    @Autowired 
    RatingRepository ratingRepository;

    @Autowired 
    CustomerRepository customerRepository;

    @Autowired
    ProductRepository productRepository;

    @Autowired
    OrderDetailRepository orderDetailRepository;

    //Tạo Rating
    @PostMapping("/createRatingByOrderDetail")
    public ResponseEntity<Object> createRatingByOrderDetail(@RequestBody RatingRequest ratingService){
        try {
            OrderDetail orderDetail = orderDetailRepository.findById(ratingService.getOrderDetailId()).get();
            if(orderDetail.getRating() != null){
                return ResponseEntity.badRequest().body("OrderDetail này đã được đánh giá");
            }
            
            Rating rating = new Rating();
            rating.setCustomer(customerRepository.findByPhoneNumber(ratingService.getUsername()).get());
            rating.setProduct(productRepository.findByProductName(ratingService.getProductName()));
            rating.setContent(ratingService.getContent());
            rating.setRatingNumber(ratingService.getRatingNumber());

            orderDetail.setRating(rating);
            rating.setOrderDetail(orderDetail);

            return ResponseEntity.ok(ratingRepository.save(rating));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }

    }

    //Lấy danh sách rating dựa tên của sản phẩm
    @GetMapping("/rating/ratingByproductName")
    public ResponseEntity<List<Rating>> getRatingByProductName(@RequestParam("productName") String productName){
        try {
            Optional<List<Rating>> ratingFound = ratingRepository.findByProductProductName(productName);
            if(ratingFound.isPresent()){
                return ResponseEntity.ok(ratingFound.get());
            }
            else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    //Xóa Comment
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    @DeleteMapping("rating/deleteRating/{ratingId}")
    public ResponseEntity<Object> deleteCommentById(@PathVariable long ratingId){
        try {
            ratingRepository.deleteById(ratingId);
            return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }


    //Gọi rating của sản phẩm đó theo số sao
    @GetMapping("/rating/{productId}/{ratingNumber}")
    public ResponseEntity<List<Rating>> getRatingByProductAndNumber(@PathVariable int productId, @PathVariable int ratingNumber){
        try {
            Product productRating = productRepository.findById(productId).get(); 
            List<Rating> ratingList = productRating.getRatings();
            List<Rating> ratingByNumber = ratingList.stream().filter(r -> r.getRatingNumber() == ratingNumber).collect(Collectors.toList());
            return ResponseEntity.ok(ratingByNumber);    
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
    
    
}
