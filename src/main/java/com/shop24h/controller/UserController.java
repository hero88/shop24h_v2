package com.shop24h.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.HashSet;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.shop24h.model.ERole;
import com.shop24h.model.Role;
import com.shop24h.model.User;
import com.shop24h.repository.CustomerRepository;
import com.shop24h.repository.RoleRepository;
import com.shop24h.repository.UserRepository;

import java.util.Set;
import java.util.stream.Collectors;


@RestController
@CrossOrigin
public class UserController {

    @Autowired 
    CustomerRepository customerRepository;

    @Autowired
    UserRepository userRepository;

    @Autowired
    RoleRepository roleRepository;

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/user/allUser")
    public ResponseEntity<Page<User>> getAllUserAndPage(@RequestParam(defaultValue = "10") int size, @RequestParam(defaultValue = "0") int page){
        try {
            Pageable paging = PageRequest.of(page, size);
            Page<User> userPage = userRepository.findAll(paging);
            return ResponseEntity.ok(userPage);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
    

    //Tìm User theo username
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/user/username")
    public ResponseEntity<Page<User>> getUserPageByUsername(@RequestParam(defaultValue = "10") int size, @RequestParam(defaultValue = "0") int page, @RequestParam String keyUsername){
        try {
            List<User> allUser = userRepository.findAll();
            List<User> userListFound = allUser.stream().filter(u -> u.getUsername().contains(keyUsername)).collect(Collectors.toList());

            Pageable paging = PageRequest.of(page, size);
            int start = page * size;
            int end = Math.min(start + size, userListFound.size());
            Page<User> userFoungPagination = new PageImpl<>(userListFound.subList(start, end), paging, userListFound.size());
            return ResponseEntity.ok(userFoungPagination);


        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    
    //Xóa User
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("user/deleteUser/{userId}")
    public ResponseEntity<Object> deleteByUserId(@PathVariable long userId){
        try {
            userRepository.deleteById(userId);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e){
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
        
    }


    //Cập nhật Quyền cho user
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("user/updateUser/{userId}/{roleName}")
    public ResponseEntity<Object> updateUser(@PathVariable long userId, @PathVariable ERole roleName) {
        try {
            User userFound = userRepository.findById(userId).get();
            Role role = roleRepository.findByName(roleName).get(); // Tìm vai trò ROLE_ADMIN từ Repository
            Set<Role> roles = new HashSet<>();
            roles.add(role);
            userFound.setRoles(roles);             
            return ResponseEntity.ok(userRepository.save(userFound));
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    


}
