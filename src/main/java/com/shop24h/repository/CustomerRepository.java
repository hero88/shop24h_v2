package com.shop24h.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.shop24h.model.Customer;

import java.util.List;
import java.util.Optional;

public interface CustomerRepository extends JpaRepository<Customer, Integer>{
    
	@Query(value = "SELECT * FROM customers WHERE last_name LIKE :lastName", nativeQuery = true)
	List<Customer> findByLastNameLike(@Param("lastName") String lastName);

	Optional<Customer> findByPhoneNumber(String phoneNumber);

    Customer findByEmail(String email);


    
}
