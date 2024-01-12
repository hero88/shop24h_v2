package com.shop24h.security.services;

import java.util.List;
import java.util.Map;

import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

public class CustomPage<T> extends PageImpl<T> {

    private Map<String, Integer> hashMapField;

    
    

    public CustomPage(List<T> content, Pageable pageable, long total) {
        super(content, pageable, total);
    }

    public Map<String, Integer> getHashMapField() {
        return hashMapField;
    }

    public void setHashMapField(Map<String, Integer
    > hashMapField) {
        this.hashMapField = hashMapField;
    }  
    
        
    
}
