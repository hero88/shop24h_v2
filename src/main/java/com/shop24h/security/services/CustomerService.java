package com.shop24h.security.services;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.shop24h.model.Customer;
import com.shop24h.model.ERole;
import com.shop24h.model.Role;
import com.shop24h.repository.CustomerRepository;

@Service
public class CustomerService {

    @Autowired
    CustomerRepository customerRepository;
    
    
    //Danh sách Customer loại bỏ các quyền ADMIN và MOD
    public List<Customer> getOnlyCustomer(){
        List<Customer> allCustomer = customerRepository.findAll();
        List<Customer> onlyCustomer = allCustomer.stream().filter(c -> {
            Set<Role> roles = c.getRole();
            if (roles == null || roles.isEmpty()) {
                return true; // Trả về true để bao gồm cả trường hợp role là null
            }
            for (Role role : roles) {
                if (role.getName()== ERole.ROLE_ADMIN || role.getName()== ERole.ROLE_MODERATOR ) {
                    return false;
                }
            }
            return true;
        }).collect(Collectors.toList());
        return onlyCustomer;

    }



    //Tìm kiếm key phone Number trên danh sách
    public List<Customer> findCustomerByPhoneNumberKey(String phoneNumber, List<Customer> customerList){

        List<Customer> customerFound = customerList.stream().filter(c -> c.getPhoneNumber().contains(phoneNumber)).collect(Collectors.toList());
        return customerFound;

    }
}
