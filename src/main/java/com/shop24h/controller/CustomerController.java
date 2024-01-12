package com.shop24h.controller;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.shop24h.model.Customer;
import com.shop24h.repository.CustomerRepository;
import com.shop24h.repository.UserRepository;
import com.shop24h.security.services.CustomerService;

import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@CrossOrigin
public class CustomerController {

    @Autowired
    CustomerRepository customerRepository;

    @Autowired
    UserRepository userRepository;

    @Autowired
    CustomerService customerService;




    //Lây danh sách customer
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    @GetMapping("/customer/allCustomer")
    public List<Customer> getAllCustomer() {
        return customerService.getOnlyCustomer();
    }
    
    //Lây danh sách customer có phân trang
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    @GetMapping("/customer/customerPanigation")
    public ResponseEntity<Page<Customer>> getAllCustomerPanigation(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size){
        try {
            List<Customer> allCustomer = customerService.getOnlyCustomer();
            Pageable paging = PageRequest.of(page, size);
            int start = page * size;
            int end = Math.min(start + size, allCustomer.size());
            Page<Customer> customerPanigation = new PageImpl<>(allCustomer.subList(start, end), paging,  allCustomer.size());
        
            return ResponseEntity.ok(customerPanigation);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    //Lây danh sách customer theo số điện thoại có sort và  phân trang
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    @GetMapping("/customer/customerByPhoneNumber/{sortValue}")
    public ResponseEntity<Page<Customer>> getAllCustomerPaginationByPhoneNumber(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size,
        @RequestParam String keyPhoneNumber,
        @PathVariable String sortValue) {

        try {
            List<Customer> allCustomer = customerService.getOnlyCustomer();
            List<Customer> customerByPhone = customerService.findCustomerByPhoneNumberKey(keyPhoneNumber, allCustomer);
    
            List<Customer> customerListSort;
            
            switch (sortValue) {
                case "orderAZ":
                    customerListSort = customerByPhone.stream()
                            .sorted(Comparator.comparing(Customer::getCountOrderCustomer))
                            .collect(Collectors.toList());
                    break;
                case "orderZA":
                    customerListSort = customerByPhone.stream()
                            .sorted(Comparator.comparing(Customer::getCountOrderCustomer).reversed())
                            .collect(Collectors.toList());
                    break;
                case "priceAZ":
                    customerListSort = customerByPhone.stream()
                            .sorted(Comparator.comparing(Customer::getTotalPriceCustomer))
                            .collect(Collectors.toList());
                    break;
                case "priceZA":
                    customerListSort = customerByPhone.stream()
                            .sorted(Comparator.comparing(Customer::getTotalPriceCustomer).reversed())
                            .collect(Collectors.toList());
                    break;
                default:
                    // Giá trị sortValue không hợp lệ
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
            }
    
            int start = page * size;
            int end = Math.min(start + size, customerListSort.size());
    
            Pageable paging = PageRequest.of(page, size);
            Page<Customer> customerPagination = new PageImpl<>(customerListSort.subList(start, end), paging, customerListSort.size());
    
            return ResponseEntity.ok(customerPagination);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
                

    //Tìm kiếm customer theo tên
    @GetMapping("/customers/last-name/{lastName}")
    public ResponseEntity<List<Customer>> getCustomersByLastNameLike(@PathVariable String lastName){
        try {
			return new ResponseEntity<>(customerRepository.findByLastNameLike(lastName), HttpStatus.OK);

        } catch (Exception e) {
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    //Tạo customer
    @PostMapping("/customer")
    public ResponseEntity<Object> createCustomer(@RequestBody Customer paramCustomer){
        try {
            Optional<Customer> customerFound = customerRepository.findByPhoneNumber(paramCustomer.getPhoneNumber());
            if(customerFound.isPresent()){
                customerFound.get().setFullName(paramCustomer.getFullName());
                customerFound.get().setEmail(paramCustomer.getEmail());
                return ResponseEntity.ok(customerRepository.save(customerFound.get()));
            } else {
                Customer newCustomer = new Customer();
                newCustomer.setFullName(paramCustomer.getFullName());
                newCustomer.setEmail(paramCustomer.getEmail());
                newCustomer.setPhoneNumber(paramCustomer.getPhoneNumber());
                customerRepository.save(newCustomer);
                return new ResponseEntity<>(newCustomer, HttpStatus.CREATED);
            }           
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }


    //Lấy Customer dựa trên customer Id
    @GetMapping ("/customer/{customerId}")
    public ResponseEntity<Object> getCustomerById(@PathVariable int customerId){
        try {
            Optional<Customer> customerFound = customerRepository.findById(customerId);
            return ResponseEntity.ok(customerFound.get());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    //Lấy Danh sách Customer theo nhóm khách hàng
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping ("/customerByPrice/{groupCustomer}")
    public ResponseEntity<List<Customer>> getCustomerByPrice(@PathVariable String groupCustomer) {
        try {
            List<Customer> listCustomerByPrice = new ArrayList<>();
            switch(groupCustomer) {
                case "Bạch Kim":
                    listCustomerByPrice = customerRepository.findAll().stream().filter(c -> c.getTotalPriceCustomer() >= 50000000).collect(Collectors.toList());
                    break;
                case "Vàng":
                    listCustomerByPrice = customerRepository.findAll().stream().filter(c -> c.getTotalPriceCustomer() >= 20000000 && c.getTotalPriceCustomer() < 50000000).collect(Collectors.toList());
                    break;
                case "Bạc":
                    listCustomerByPrice = customerRepository.findAll().stream().filter(c -> c.getTotalPriceCustomer() >= 10000000 && c.getTotalPriceCustomer() < 20000000).collect(Collectors.toList());
                    break;
                case "Vip":
                    listCustomerByPrice = customerRepository.findAll().stream().filter(c -> c.getTotalPriceCustomer() >= 5000000 && c.getTotalPriceCustomer() < 10000000).collect(Collectors.toList());
                    break;
                default:
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
            }
            return ResponseEntity.ok(listCustomerByPrice);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    //Lấy Danh sách Customer theo đơn hàng
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping ("/customerByCountOrder/{countOrder}")
    public ResponseEntity<List<Customer>> getCustomerByCountOrder(@PathVariable int countOrder) {
        try {
            List<Customer> listCustomerByOrder = customerRepository.findAll().stream().filter(i -> i.getCountOrderCustomer() == countOrder).collect(Collectors.toList());
            return ResponseEntity.ok(listCustomerByOrder);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    //Xóa Customer
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    @DeleteMapping("/customer/deleteCustomer/{customerId}")
    public ResponseEntity<Object> deleteOrderByOrderId(@PathVariable int customerId){
        try {
            customerRepository.deleteById(customerId);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }


    //Cập nhật customer
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    @PutMapping("/customer/updateCustomer/{customerId}")
    public ResponseEntity<Object> updateCustomer(@PathVariable int customerId, @RequestBody Customer customer){
        try {
            //Kiểm tra tên email trùng lặp
            Customer existEmailCustomer = customerRepository.findByEmail(customer.getEmail());
            if(existEmailCustomer != null && existEmailCustomer.getId() != customerId){
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Email đã tồn tại");
            }
            
            Customer customerFound = customerRepository.findById(customerId).get();
            customerFound.setEmail(customer.getEmail());
            customerFound.setFullName(customer.getFullName());
            customerRepository.save(customerFound);

            return ResponseEntity.ok(customerFound);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

}
 