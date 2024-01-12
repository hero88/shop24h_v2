package com.shop24h.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.shop24h.model.User;

public interface UserRepository extends JpaRepository<User, Long> {
  Optional<User> findByUsername(String username);

  Boolean existsByUsername(String username);

}
