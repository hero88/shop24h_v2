package com.shop24h.service;

import java.io.File;
import java.io.InputStream;
import java.nio.file.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.apache.commons.lang3.RandomStringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.multipart.MultipartFile;

import com.shop24h.model.Product;
import com.shop24h.payload.request.ProductRequest;
import com.shop24h.repository.ProductLineRepository;
import com.shop24h.repository.ProductRepository;

import java.nio.file.Paths;
import org.springframework.core.io.Resource;




@Service
public class ProductService {
    
    @Autowired
    ProductRepository productRepository;

    @Autowired
    ProductLineRepository productLineRepository;


    @Autowired
    StorageService storageService;

    @Autowired
    StorageFirebaseService storageFirebaseService;

//
//    @Value("${upload.directory}")
//    private String uploadDirectory;



    public List<Product> findProductByKeyName(String name){
        String [] nameArray = name.split(" ");
        List<Product> allProduct = productRepository.findAll();
    
        List<Product> filterProductName = allProduct.stream().filter(product -> {
            for (String keyword : nameArray) {
                if (!product.getProductName().toLowerCase().contains(keyword.toLowerCase())) {
                    return false;
                }
            }
            return true;})
            .collect(Collectors.toList());
        return filterProductName;
    }

    //TÌm kiếm sản phẩm theo tên sản phẩm có phân trang
    // public Page<Product> findProductByKeyNameAndPage(String name, Pageable pageable) {
    //     String[] nameArray = name.split(" ");
    //     Stream<Product> productStream = StreamSupport.stream(productRepository.findAll(pageable).spliterator(), false);
    //     List<Product> productList = productStream.collect(Collectors.toList());
    //     productList = productList.stream()
    //             .filter(product -> {
    //                 for (String keyword : nameArray) {
    //                     if (!product.getProductName().toLowerCase().contains(keyword.toLowerCase())) {
    //                         return false;
    //                     }
    //                 }
    //                 return true;
    //             })
    //             .collect(Collectors.toList());
    
    //     return new PageImpl<>(productList, pageable, productList.size());
    // }
    
    public ResponseEntity<Object> createProduct(Map<String, String> fileMap, MultipartFile[] productImg, int productLineId){
        try {
            if (productRepository.existsByProductName(fileMap.get("productName"))) {
                return ResponseEntity.badRequest().body("Tên sp đã tồn tại");
            }
            if (productRepository.existsByProductCode(fileMap.get("productCode"))) {
                return ResponseEntity.badRequest().body("Mã Sp đã tồn tại");
            }

            Product newProduct = new Product();
            newProduct.setProductCode(fileMap.get("productCode"));
            newProduct.setProductName(fileMap.get("productName"));
            newProduct.setBuyPrice((long) Double.parseDouble(fileMap.get("buyPrice")));
            newProduct.setProductVendor(fileMap.get("productVendor"));
            newProduct.setQuantityInStock(Integer.parseInt(fileMap.get("quantityInStock")));
            newProduct.setProductDescripttion(fileMap.get("productDescription"));   
            
            if (productImg != null && productImg.length > 0) {
                List<String> strImageList = new ArrayList<>();
                for (MultipartFile image : productImg) {
                    String fileName = storageFirebaseService.uploadImage(image);
                    // Thêm đường dẫn của file vào danh sách
                    strImageList.add(fileName);
                }
                newProduct.setProductImg(strImageList);
            }
            newProduct.setProductLine(productLineRepository.findById(productLineId).get());        
            return ResponseEntity.status(HttpStatus.CREATED).body(productRepository.save(newProduct));          
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }        
    }

    public ResponseEntity<String> deleteProduct(int productId){
        try {
            if (!productRepository.existsById(productId)) {
                return ResponseEntity.badRequest().body("Sản phẩm không tồn tại");
            }
            
            Product product = productRepository.findById(productId).get();
            List<String> imageProduct = product.getProductImg();
            //Xóa hình ảnh trên storage Firebase
            for(String img : imageProduct){
                storageFirebaseService.deleteImage(img);
            }

            productRepository.deleteById(productId);    
            return ResponseEntity.status(HttpStatus.NO_CONTENT).body("Đã Xóa");            
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }        
    }

    public ResponseEntity<Object> updateProduct(int productId, Map<String, String> productMap, MultipartFile[] productImg){
        try {
            Optional<Product> productFound = productRepository.findById(productId);
            if(productFound.isPresent()){
                Product product = productFound.get();
    
                // Kiểm tra tên sản phẩm trùng lặp
                Product existingProductName = productRepository.findByProductName(productMap.get("productName"));
                if (existingProductName != null && existingProductName.getId() != productId) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Tên sp đã tồn tại");
                }
    
                // Kiểm tra code sản phẩm trùng lặp
                Product existingProductCode = productRepository.findByProductCode(productMap.get("productCode"));
                if (existingProductCode != null && existingProductCode.getId() != productId) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Mã Sp đã tồn tại");
                }
    
                // Cập nhật thông tin sản phẩm
                product.setProductCode(productMap.get("productCode"));
                product.setProductName(productMap.get("productName"));
                product.setProductDescripttion(productMap.get("productDescripttion"));
                product.setProductVendor(productMap.get("productVendor"));
                product.setQuantityInStock(Integer.parseInt(productMap.get("quantityInStock")));
                product.setBuyPrice((long) Double.parseDouble(productMap.get("buyPrice")));
    
                //Xóa hình ảnh cũ
                if (productMap.containsKey("productImgRemove")) {
                    String[] productImgRemoveArray = productMap.get("productImgRemove").split(",");
                    
                    // Duyệt qua mảng để xử lý từng giá trị
                    for (String imageName : productImgRemoveArray) {
                        // Xử lý mỗi giá trị imageName ở đây
                        storageFirebaseService.deleteImage(imageName);
                        product.removeProductImage(imageName);
                    }
                }
    
                //Add hình ảnh mới
                if (productImg != null && productImg.length > 0) {
                    for (MultipartFile image : productImg) {
                        String fileName = storageFirebaseService.uploadImage(image);
                        // Thêm đường dẫn của file vào danh sách
                        product.addProductImage(fileName);
                    }
                }
    
                return ResponseEntity.ok(productRepository.save(product));
            }
            else {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
            }
            
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
  
    }
}
