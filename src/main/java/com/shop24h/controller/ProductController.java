package com.shop24h.controller;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Calendar;
import java.util.Collections;
import java.util.Comparator;
import java.util.Date;
import java.util.List;
import java.util.Map;

import java.util.Optional;
import java.util.stream.Collectors;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
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
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.shop24h.model.Product;
import com.shop24h.payload.request.ProductRequest;
import com.shop24h.repository.ProductLineRepository;
import com.shop24h.repository.ProductRepository;
import com.shop24h.security.services.ProductService;
import com.shop24h.security.services.StorageService;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;



@CrossOrigin
@RestController
public class    ProductController {

    @Autowired
    ProductRepository productRepository;

    @Autowired
    ProductLineRepository productLineRepository;

    @Autowired
    ProductService productService;

    @Autowired
    private StorageService storageService;


    //Lấy tất cả sản phẩm
    @GetMapping("/products")
    public List<Product> getAllProduct(){
        return productRepository.findAll();
    }


    //Lấy Tất cả sản phẩm và phân trang 
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    @GetMapping("/productsAndPanagation")
    public ResponseEntity<Page<Product>> getAllProductAndAPanagation(@RequestParam(defaultValue = "0") int page, 
                                                        @RequestParam(defaultValue = "20") int size){
        Pageable paging = PageRequest.of(page, size);

        Page<Product> products = productRepository.findAll(paging);

        return ResponseEntity.ok(products);
    }

    // Lấy  Sản phẩm bán chạy nhất
    @GetMapping("/productBestSell/{numberProduct}")
    public ResponseEntity<Object> getProductBestSell(@PathVariable int numberProduct){
        try {
            List<Product> allProduct = productRepository.findAll();
            List<Product> topSoldProducts = allProduct.stream()
            .sorted(Comparator.comparingInt(Product::getProductSold).reversed())
            .limit(numberProduct)
            .collect(Collectors.toList());
            return ResponseEntity.ok(topSoldProducts);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }


    // Lấy sản phẩm theo productLineId
    @GetMapping("/productByProductLine/{productLineId}")
    public List<Product> getProductByProductLineId(@PathVariable int productLineId){   
        return productRepository.findByProductLineId(productLineId);
    }

    // Lấy sản phẩm theo productLineId và trang
    @GetMapping("/productByProductLineAndPage/{productLineId}")
    public List<Product> getProductByProductLineIdAndPage(@PathVariable int productLineId, @RequestParam int page, @RequestParam int size){
        List<Product> products = productRepository.findByProductLineId(productLineId);
        Collections.shuffle(products);
        int startIndex = page * size;
        int endIndex = Math.min(startIndex + size, products.size());
        return products.subList(startIndex, endIndex);
    }

    // Lấy sản phẩm theo productLine ID và phân trang
    @GetMapping("/productByProductLineIdAndPanigation/{productLineId}")
    public ResponseEntity<Page<Product>> getProductByProductLineIdAndPanigation(
        @PathVariable int productLineId,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size) {
    
        Pageable pageable = PageRequest.of(page, size);
        Page<Product> products = productRepository.findByProductLineId(productLineId, pageable);
    
        return ResponseEntity.ok(products);
    }

        // Tìm sản phẩm theo productLine Id và name có Phân Trang
        // @GetMapping("/search/productLine/{productLineId}")
        // public ResponseEntity<Page<Product>> searchProductByProductLineIdAndNamePanigation(
        //     @PathVariable int productLineId,
        //     @RequestParam(defaultValue = "0") int page,
        //     @RequestParam(defaultValue = "10") int size) {
        
        //     Pageable pageable = PageRequest.of(page, size);
        //     Page<Product> products = productRepository.findByProductLineId(productLineId, pageable);
        
        //     return ResponseEntity.ok(products);
        // }


    // Lấy sản phẩm theo productLine Name và phẩn trang
    @GetMapping("/productByProductLineName/{productLineName}")
    public ResponseEntity<Page<Product>> getProductByProductLineName(
        @PathVariable String productLineName,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "8") int size) {
    
        Pageable pageable = PageRequest.of(page, size);
        Page<Product> products = productRepository.findByProductLineProductLineName(productLineName, pageable);
    
        return ResponseEntity.ok(products);
    }

    //Lấy sản phẩm theo tên Sản phẩm
    @GetMapping("/productByName")
    public ResponseEntity<Product> getProductByName(@RequestParam String name){
        try {
            return ResponseEntity.ok(productRepository.findByProductName(name));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    
    //Lấy sản phẩm theo tên key name Sản Phẩm và phân trang
    @GetMapping("/productByKeyName")
    public ResponseEntity<Page<Product>> getProductsByKeyName(
            @RequestParam String name,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "8") int size) {
    
        try {
            Pageable paging = PageRequest.of(page, size);
            List<Product> products = productService.findProductByKeyName(name);
    
            int start = (int) paging.getOffset();
            int end = Math.min((start + paging.getPageSize()), products.size());
            Page<Product> pageProducts = new PageImpl<>(products.subList(start, end), paging, products.size());
    

            return new ResponseEntity<>(pageProducts, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
    


    // Lấy sản phẩm theo productId
    @GetMapping("/productByProductId/{productId}")
    public Product getProductByProductId(@PathVariable int productId){   
        return productRepository.findById(productId).get();
    }
    
    //Lấy danh sách sản phẩm theo search ProductLine Id và name trong Dashboard
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    @GetMapping("/product/AminSearch/productLine/{productLineId}")
    public ResponseEntity<Page<Product>> getProductFindByNameAndProductLineId(@PathVariable int productLineId, @RequestParam(required = false) String keyName, @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "8") int size){
        try {
            List<Product> productAll = productRepository.findAll();
            List<Product> productFound = new ArrayList<>();
            if(productLineId == 0 && keyName == null){
                productFound = productAll;
            }
            if(productLineId == 0 && keyName != null){
                productFound = productService.findProductByKeyName(keyName);
            }
            if(productLineId != 0 && keyName == null){
                productFound = productRepository.findByProductLineId(productLineId);
            }
            if(productLineId != 0 && keyName != null){
                List<Product> productA = productRepository.findByProductLineId(productLineId);
                List<Product> productB = productService.findProductByKeyName(keyName);
                for (Product product : productA){
                    if(productB.contains(product)){
                        productFound.add(product);
                    }
                }
            }
            Pageable paging = PageRequest.of(page, size);
            int start = (int) paging.getOffset();
            int end = Math.min(start + paging.getPageSize(), productFound.size());
            Page<Product> productPage = new PageImpl<>(productFound.subList(start, end), paging, productFound.size());
            return ResponseEntity.ok(productPage);

            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);        }
    }




    //Láy danh sách sản phảm theo Search        
    @GetMapping("/product/search")
    public ResponseEntity<Page<Product>> getProductFind(
        @RequestParam(value = "keyValue", required = false) String keyValue,
        @RequestParam(value = "keyBrand", required = false) String[] keyBrand,
        @RequestParam(value = "keyLine", required = false) String[] keyLine,
        @RequestParam(value ="keyPrice", required = false) Long[] keyPrice,
        @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "8") int size) {
        
        try {
            List<Product> productFound = productService.findProductByKeyName(keyValue);
    
            if (keyValue.isEmpty()) {
                productFound = productRepository.findAll();
            }
    
            if (keyBrand != null && keyBrand.length > 0) {
                productFound = productFound.stream()
                    .filter(product -> Arrays.asList(keyBrand).contains(product.getProductVendor()))
                    .collect(Collectors.toList());
            }
    
            if (keyLine != null && keyLine.length > 0) {
                productFound = productFound.stream()
                    .filter(product -> Arrays.asList(keyLine)
                    .contains(product.getProductLine().getProductLineName()))
                    .collect(Collectors.toList());
            }

            // if(keyPrice[0] != null && keyPrice[1] != null ){
            //     productFound = productFound.stream().filter(product -> product.getBuyPrice() >= keyPrice[0] && product.getBuyPrice() <= keyPrice[1]).collect(Collectors.toList());
            // }

            // if(keyPrice[0] == null && keyPrice[1] != null ){
            //     productFound = productFound.stream().filter(product -> product.getBuyPrice() <= keyPrice[1]).collect(Collectors.toList());
            // }

            // if(keyPrice[0] != null && keyPrice[1] == null ){
            //     productFound = productFound.stream().filter(product -> product.getBuyPrice() >= keyPrice[0]).collect(Collectors.toList());
            // }

            productFound = productFound.stream()
                .filter(product -> (keyPrice[0] == null || product.getBuyPrice() >= keyPrice[0])
                         && (keyPrice[1] == null || product.getBuyPrice() <= keyPrice[1]))
                .collect(Collectors.toList());

            //Phân trang
            Pageable paging = PageRequest.of(page, size);
            int start = page * size;
            int end = Math.min(start + size, productFound.size());


            Page<Product> pageProductFound = new PageImpl<>(productFound.subList(start, end), paging, productFound.size());


    
            return ResponseEntity.ok(pageProductFound);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
    
//Cập nhật sản phẩm theo ID
@PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
@PutMapping("/updateProduct/{productId}")
public ResponseEntity<Object> updateProduct(@PathVariable int productId, @RequestBody Product updateProduct){
    
    Optional<Product> productFound = productRepository.findById(productId);
    if(productFound.isPresent()){
        Product product = productFound.get();

        // Kiểm tra tên sản phẩm trùng lặp
        Product existingProductName = productRepository.findByProductName(updateProduct.getProductName());
        if (existingProductName != null && existingProductName.getId() != productId) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Tên sp đã tồn tại");
        }

        // Kiểm tra code sản phẩm trùng lặp
        Product existingProductCode = productRepository.findByProductCode(updateProduct.getProductCode());
        if (existingProductCode != null && existingProductCode.getId() != productId) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Mã Sp đã tồn tại");
        }
        

        // Cập nhật thông tin sản phẩm
        product.setProductImg(updateProduct.getProductImg());
        product.setProductCode(updateProduct.getProductCode());
        product.setProductName(updateProduct.getProductName());
        product.setProductDescripttion(updateProduct.getProductDescripttion());
        product.setProductVendor(updateProduct.getProductVendor());
        product.setQuantityInStock(updateProduct.getQuantityInStock());
        product.setBuyPrice(updateProduct.getBuyPrice());

        return ResponseEntity.ok(productRepository.save(product));
    }
    else {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
    }
}
        
    //Tạo Sản phẩm theo productLineId
    // @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    @PostMapping(value = "/createProduct/{productLineId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createProduct(@RequestParam Map<String, String> fileMap, @RequestParam MultipartFile[] productImg, @PathVariable int productLineId) {
            return productService.createProduct(fileMap, productImg,  productLineId);
    }

    //Show image
    @GetMapping("/product-photos/{filename}")
    public ResponseEntity<Resource> downloadProductPhoto(@PathVariable String filename) {
        try {
            Resource resource = storageService.loadAsResource(filename);
            return ResponseEntity.ok().header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"").body(resource);
        } catch (Exception e) {
      
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }



    //Xóa Sản phẩm theo product Id
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    @DeleteMapping("/deleteProduct/{productId}")
    public ResponseEntity<Object> deleteProduct(@PathVariable int productId){
        try {
            productRepository.deleteById(productId);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }

    }

    //Tính tổng sản phẩm  bán theo tháng dựa theo thương hiệu 
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/product/totalBrandProductByMonth")
    public ResponseEntity<Object> getTotalBrandProductByMonth(@RequestParam("startMonth") String startMonthStr, @RequestParam("endMonth") String endMonthStr){
        try {

            SimpleDateFormat dateFormat = new SimpleDateFormat("MM-yyyy");
            Date startMonth = dateFormat.parse(startMonthStr);
            Date endMonth = dateFormat.parse(endMonthStr);

            Calendar calendar = Calendar.getInstance();
            calendar.setTime(startMonth);
            calendar.add(Calendar.MONTH, -1);
            startMonth = calendar.getTime();
            return ResponseEntity.ok(productRepository.getTotalBrandProductByMonth(startMonth, endMonth));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }


    //Tính tổng sản phẩm  bán theo ngày dựa theo thương hiệu 
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/product/totalBrandProductByDate")
    public ResponseEntity<Object> getTotalBrandProductByDate(@RequestParam("startDate") String startDateStr, @RequestParam("endDate") String endDateStr){
        try {

            SimpleDateFormat dateFormat = new SimpleDateFormat("dd-MM-yyyy");
            Date startDate = dateFormat.parse(startDateStr);
            Date endDate = dateFormat.parse(endDateStr);

            return ResponseEntity.ok(productRepository.getTotalBrandProductByDate(startDate, endDate));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    //Tính tổng sản phẩm top 10  bán theo tháng
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/product/totalProductByMonth")
    public ResponseEntity<Object> getProductByMonth(@RequestParam("startMonth") String startMonthStr, @RequestParam("endMonth") String endMonthStr){
        try {

            SimpleDateFormat dateFormat = new SimpleDateFormat("MM-yyyy");
            Date startMonth = dateFormat.parse(startMonthStr);
            Date endMonth = dateFormat.parse(endMonthStr);

            Calendar calendar = Calendar.getInstance();
            calendar.setTime(startMonth);
            calendar.add(Calendar.MONTH, -1);
            startMonth = calendar.getTime();
            return ResponseEntity.ok(productRepository.getProductByMonth(startMonth, endMonth));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    

}
