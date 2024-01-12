package com.shop24h.controller;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Comparator;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.apache.commons.lang3.RandomStringUtils;
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

import com.shop24h.model.Order;
import com.shop24h.repository.CustomerRepository;
import com.shop24h.repository.DistrictRepository;
import com.shop24h.repository.OrderDetailRepository;
import com.shop24h.repository.OrderRepository;
import com.shop24h.repository.ProvinceRepository;
import com.shop24h.repository.WardRepository;
import com.shop24h.security.services.CustomPage;


@RestController
@CrossOrigin
public class OrderController {

    @Autowired
    OrderRepository orderRepository;

    @Autowired
    ProvinceRepository provinceRepository;


    @Autowired
    DistrictRepository districtRepository;


    @Autowired
    WardRepository wardRepository;

    @Autowired
    CustomerRepository customerRepository;

    @Autowired
    OrderDetailRepository orderDetailRepository;


    
    @CrossOrigin
    //Tạo Order trên Web User
    @PostMapping("/order/customer/{customerId}/province/{provinceId}/district/{districtId}/ward/{wardId}")
    public ResponseEntity<Object> createCustomer(@RequestBody Order order, @PathVariable int customerId, @PathVariable int provinceId, @PathVariable int districtId, @PathVariable int wardId){
        try {
            String orderCode = RandomStringUtils.randomAlphanumeric(10);
            order.setOrderCode(orderCode);
            order.setOrderDate(new Date());
            order.setRequiredDate(null);
            order.setShippedDate(null);
            order.setCustomer(customerRepository.findById(customerId).get());
            order.setProvince(provinceRepository.findById(provinceId).get());
            order.setDistrict(districtRepository.findById(districtId).get());
            order.setWard(wardRepository.findById(wardId).get());

            return new ResponseEntity<>( orderRepository.save(order), HttpStatus.CREATED);
        } catch (Exception e) {
           return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    //Lấy Order dựa trên order Id
    @GetMapping ("/order/{orderId}")
    public ResponseEntity<Object> getOrderById(@PathVariable int orderId){
        try {
            Optional<Order> orderFound = orderRepository.findById(orderId);
            return ResponseEntity.ok(orderFound.get());
        } catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    //Lấy All Order dựa trên phoneNumber và status của khách hàng có phân trang 
    @GetMapping ("/order/orderPhoneNumber/{phoneNumber}/{status}")
    public ResponseEntity<Page<Order>> getOrderByPhoneNumberCustomer(@PathVariable String phoneNumber, @PathVariable String status, @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "2") int size){
        try {
                        
            List<Order> orderFound = orderRepository.findByCustomerPhoneNumber(phoneNumber).stream()
            .filter(o -> o.getStatus().equals(status))
            .sorted(Comparator.comparing(Order::getOrderDate).reversed()) // Sắp xếp theo thời gian giảm dần
            .collect(Collectors.toList());
            
            
            Pageable paging = PageRequest.of(page, size);
            int start = page * size;
            int end = Math.min(start + size, orderFound.size());
            Page<Order> orderFoundPagination = new PageImpl<>(orderFound.subList(start, end), paging, orderFound.size());

            return ResponseEntity.ok(orderFoundPagination);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
    

    //Lấy tất cả order
    @GetMapping("/orders")
    public List<Order> getAllOrder(){
        return orderRepository.findAll();
    }

    //Lấy tất cả Order có phân trang
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    @GetMapping("/orders/ordersAndPanigation")
    public ResponseEntity<CustomPage<Order>> getAllOrderAndPanigation(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size){
        Pageable paging = PageRequest.of(page, size);
        List<Order> allOrder = orderRepository.findAll();
        Page<Order> orderPage = orderRepository.findAll(paging);

        long totalPriceOrderFound = 0;


        // Tạo map để lưu trữ số lượng đơn hàng cho mỗi trạng thái
        Map<String, Integer> countByStatus = new HashMap<>();

        // Duyệt qua danh sách và tăng giá trị tương ứng trong map
        for (Order order : allOrder) {
            String statusIndex = order.getStatus();
            //Hàm Put trong map để cập nhật cặp key-value trong HashMap
            //countByStatus.getOrDefault(statusIndex, 0) là lấy value của key, nếu không có trả về 0
            countByStatus.put(statusIndex, countByStatus.getOrDefault(statusIndex, 0) + 1);
            totalPriceOrderFound += order.getTotalPriceOrder();

        }
        countByStatus.put("totalPrice", (int) totalPriceOrderFound);

        //Chuyển key Tiếng Việt thành tiếng Anh
            Map<String, Integer> updatedCountByStatus = new HashMap<>();

        for (Map.Entry<String, Integer> entry : countByStatus.entrySet()) {
            String oldKey = entry.getKey();
            Integer value = entry.getValue();

            // Đổi tên key
            String newKey = null;
            switch (oldKey) {
                case "Đã Giao":
                    newKey = "success";
                    break;
                case "Đang Giao":
                    newKey = "delivery";
                    break;
                case "Chờ Xác Nhận":
                    newKey = "waitConfirm";
                    break;
                default:
                    newKey = oldKey; // Giữ nguyên key nếu không cần đổi
            }

            // Thêm key mới và value vào updatedCountByStatus
            updatedCountByStatus.put(newKey, value);
        }

        // Thay thế countByStatus bằng updatedCountByStatus
        countByStatus = updatedCountByStatus;
        
    
        CustomPage<Order> customPage = new CustomPage<>(orderPage.getContent(), paging, orderPage.getTotalElements());
        customPage.setHashMapField(countByStatus);
    
        return ResponseEntity.ok(customPage);
    }

    //Update Order bới OrderId trên FE trang OrderDetail Admin và OrderDetail = null
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    @PutMapping("updateOrder/order/{orderId}/province/{provinceId}/district/{districtId}/ward/{wardId}")
    public ResponseEntity<Object> updateOrderByOrderId(@RequestBody Order order, @PathVariable int orderId,@PathVariable int provinceId, @PathVariable int districtId, @PathVariable int wardId){
        try {
            Order orderFound =  orderRepository.findById(orderId).get();
            orderFound.setProvince(provinceRepository.findById(provinceId).get());
            orderFound.setDistrict(districtRepository.findById(districtId).get());
            orderFound.setWard(wardRepository.findById(wardId).get());
            orderFound.setAddress(order.getAddress());
            orderFound.setComments(order.getComments());
            return ResponseEntity.ok(orderRepository.save(orderFound));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    //Lấy Order theo date
    @GetMapping("/orders/date")
    public ResponseEntity<Object> getOrderDateByDate(@RequestParam("startDate") String startDateStr, @RequestParam("endDate") String endDateStr) {
        try {
            SimpleDateFormat dateFormat = new SimpleDateFormat("dd-MM-yyyy");
            Date startDate = dateFormat.parse(startDateStr);
            Date endDate = dateFormat.parse(endDateStr);
            
            Calendar calendar = Calendar.getInstance();
            calendar.setTime(endDate);
            calendar.add(Calendar.DATE, 1);
            endDate = calendar.getTime();
    
            return ResponseEntity.ok(orderRepository.findOrdersBetweenDates(startDate, endDate));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
    
    //Lấy Order theo Date và status có phân trang
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    @GetMapping("/orders/searchDateAndStatusAndCustomer/{startDateStr}/{endDateStr}/{status}/{customerId}")
    public ResponseEntity<CustomPage<Order>> getOrderDateByDateAndStatusPagination(
        @PathVariable String startDateStr, 
        @PathVariable String endDateStr, 
        @PathVariable String status, 
        @PathVariable int customerId, 
        @RequestParam(defaultValue = "0") int page, 
        @RequestParam(defaultValue = "10") int size) {
        
        try {
            SimpleDateFormat dateFormat = new SimpleDateFormat("dd-MM-yyyy");
            Date startDate = dateFormat.parse(startDateStr);
            Date endDate = dateFormat.parse(endDateStr);
    
            Calendar calendar = Calendar.getInstance();
            calendar.setTime(endDate);
            calendar.add(Calendar.DATE, 1);
            endDate = calendar.getTime();
    
            List<Order> ordersByDate = orderRepository.findOrdersBetweenDates(startDate, endDate);

            List<Order> orderFound = new ArrayList<>();

            orderFound = ordersByDate.stream()
                .filter(order -> (status.equals("All") || order.getStatus().equals(status))
                        && (customerId == 0 || order.getCustomer().getId() == customerId))
                .collect(Collectors.toList());
    
            // List<Order> filteredOrders = customerId == 0
            //     ? ordersByDate
            //     : ordersByDate.stream()
            //         .filter(order -> order.getCustomer().getId() == customerId)
            //         .collect(Collectors.toList());
    
            // List<Order> orderFound = status.equals("All")
            //     ? filteredOrders
            //     : filteredOrders.stream()
            //         .filter(order -> order.getStatus().equals(status))
            //         .collect(Collectors.toList());
    
            Pageable paging = PageRequest.of(page, size);
            int start = (int) paging.getOffset();
            int end = Math.min(start + size, orderFound.size());
    
            long totalPrice = 0;
            Map<String, Integer> countByStatus = new HashMap<>();
            
            // Duyệt qua danh sách HashMap và tăng giá trị tương ứng trong map
            for (Order order : orderFound) {
                String orderStatus = order.getStatus();
                //Hàm Put trong map để cập nhật cặp key-value trong HashMap
                //countByStatus.getOrDefault(statusIndex, 0) là lấy value của key trong Hasmap và cộng thêm 1, nếu không có trả về 0
                countByStatus.put(orderStatus, countByStatus.getOrDefault(orderStatus, 0) + 1);
                totalPrice += order.getTotalPriceOrder();
            }
    
            countByStatus.put("totalPrice", (int) totalPrice);
    
            Map<String, Integer> updatedCountByStatus = new HashMap<>();
            
            //Chuyển key Tiếng Việt thành tiếng Anh
            for (Map.Entry<String, Integer> entry : countByStatus.entrySet()) {
                String oldStatus = entry.getKey();
                Integer value = entry.getValue();
    
                String newStatus = switch (oldStatus) {
                    case "Đã Giao" -> "success";
                    case "Đang Giao" -> "delivery";
                    case "Chờ Xác Nhận" -> "waitConfirm";
                    default -> oldStatus;
                };
    
                updatedCountByStatus.put(newStatus, value);
            }
       
            CustomPage<Order> paginatedOrderResponse = new CustomPage<>(
                orderFound.subList(start, end),
                paging,
                orderFound.size()
            );
    
            paginatedOrderResponse.setHashMapField(updatedCountByStatus);
    
            return ResponseEntity.ok(paginatedOrderResponse);
    
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
        

    //Lấy Tổng Giá Tiền Order theo ngày
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/orders/priceOrderByDate")
    public ResponseEntity<Object> getPriceOrderByDate(@RequestParam("startDate") String startDateStr, @RequestParam("endDate") String endDateStr) {
        try {
            SimpleDateFormat dateFormat = new SimpleDateFormat("dd-MM-yyyy");
            Date startDate = dateFormat.parse(startDateStr); 
            Date endDate = dateFormat.parse(endDateStr);
    
            return ResponseEntity.ok(orderRepository.findTotalPriceOrderByDate(startDate, endDate));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }   

    //Lấy Tổng Giá Tiền Order theo Tháng
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/orders/priceOrderByMonth")
    public ResponseEntity<Object> getPriceOrderByMonth(@RequestParam("startMonth") String startMonthStr, @RequestParam("endMonth") String endMonthStr) {
        try {
            SimpleDateFormat dateFormat = new SimpleDateFormat("MM-yyyy");
            Date startMonth = dateFormat.parse(startMonthStr);
            Date endMonth = dateFormat.parse(endMonthStr);

            Calendar calendar = Calendar.getInstance();
            calendar.setTime(startMonth);
            calendar.add(Calendar.MONTH, -1);
            startMonth = calendar.getTime();
        
            return ResponseEntity.ok(orderRepository.findTotalPriceOrderByMonth(startMonth, endMonth));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
    
    //Lấy Tổng Giá Tiền Order theo Tuần
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/orders/priceOrderByWeek")
    public ResponseEntity<Object> getPriceOrderByWeek(@RequestParam("startWeek") String startWeek, @RequestParam("endWeek") String endWeek) {
        try {
            
    
            return ResponseEntity.ok(orderRepository.findTotalPriceOrderByWeek(startWeek, endWeek));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    //Xóa Order theo Id
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    @DeleteMapping("/deleteOrder/{orderId}")
    public ResponseEntity<Object> deleteOrderByOrderId(@PathVariable int orderId){
        try {
            orderRepository.deleteById(orderId);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
    
    //Cập Nhật trạng thái Order
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    @PutMapping("/updateStatusOrder/{orderId}/{status}")
    public ResponseEntity<Object> updateStatusOrder(@PathVariable int orderId, @PathVariable String status){
        try {
            return ResponseEntity.ok(orderRepository.updateStatus(status, orderId));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
    
    
    
}

    


