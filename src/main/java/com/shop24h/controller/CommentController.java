package com.shop24h.controller;

import java.util.Date;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.shop24h.model.Comment;
import com.shop24h.repository.CommentRepository;
import com.shop24h.repository.CustomerRepository;
import com.shop24h.repository.ProductRepository;
import com.shop24h.repository.RatingRepository;
import org.springframework.security.access.prepost.PreAuthorize;


@CrossOrigin
@RestController
public class CommentController {

    @Autowired
    CommentRepository commentRepository;

    @Autowired
    ProductRepository productRepository;

    @Autowired
    CustomerRepository customerRepository;

    @Autowired
    RatingRepository ratingRepository;

    
    //Tạo comment
    @PostMapping("comment/createComment/rating/{ratingId}/customer/{customerPhoneNumber}")
    public ResponseEntity<Object> creatComment(@PathVariable long ratingId, @PathVariable String customerPhoneNumber, @RequestBody Comment comment){
        try {
            Comment newComment = new Comment();
            newComment.setContent(comment.getContent());
            newComment.setCustomer(customerRepository.findByPhoneNumber(customerPhoneNumber).get());
            newComment.setRating(ratingRepository.findById(ratingId).get());
            newComment.setCreatDate(new Date());
            return ResponseEntity.ok(commentRepository.save(newComment));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    //Xóa Comment
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    @DeleteMapping("comment/deleteComment/comment/{commentId}")
    public ResponseEntity<Object> deleteCommentById(@PathVariable long commentId){
        try {
            commentRepository.deleteById(commentId);
            return ResponseEntity.status(HttpStatus.NO_CONTENT).body("Xóa thành công");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
}
