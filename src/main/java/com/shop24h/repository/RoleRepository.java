package com.shop24h.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.shop24h.model.ERole;
import com.shop24h.model.Role;

public interface RoleRepository extends JpaRepository<Role, Integer> {
  Optional<Role> findByName(ERole name);

}
