package com.shop24h.repository;


import org.springframework.data.jpa.repository.JpaRepository;

import com.shop24h.model.Comment;

public interface CommentRepository extends JpaRepository<Comment, Long>{
    

    
}
