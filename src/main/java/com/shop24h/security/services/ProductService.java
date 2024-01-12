package com.shop24h.security.services;

import java.io.File;
import java.io.InputStream;
import java.nio.file.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.apache.commons.lang3.RandomStringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
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

    private final String UPLOAD_DIRECTORY_IMAGE = "upload";

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
            
            List<String> strImageList = new ArrayList<>();
            
            
            for (MultipartFile image : productImg) {
                String fileName  = image.getOriginalFilename();
                String randomFileName = RandomStringUtils.randomAlphanumeric(5) + fileName;                
                //Lưu file
                storageService.store(randomFileName, image);
                String urlImg = UPLOAD_DIRECTORY_IMAGE + "/" + randomFileName;
                // Thêm đường dẫn của file vào danh sách
                strImageList.add(urlImg);
            }

            // Lưu đường dẫn hình ảnh vào đối tượng Product
            newProduct.setProductImg(strImageList);
            newProduct.setProductLine(productLineRepository.findById(productLineId).get());
            // Lưu đối tượng Product vào cơ sở dữ liệu
           
            return ResponseEntity.status(HttpStatus.CREATED).body(productRepository.save(newProduct));
            
        } catch (Exception e) {
            File directory = new File("../");
            System.out.println(directory.getAbsolutePath());
            System.out.println(e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }        
    }
}
