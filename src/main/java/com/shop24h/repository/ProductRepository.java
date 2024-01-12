package com.shop24h.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.shop24h.model.Product;
import java.util.Date;


public interface ProductRepository extends JpaRepository<Product, Integer>{
    List<Product> findByProductLineId( int productLineId);


    // @Query(value = "SELECT * FROM products WHERE product_line_id = :para1", nativeQuery = true)
    // List<Product> getProductByProductLineAndPage(@Param("para1") int productLineId, PageRequest pageRequest);

    

    Product findByProductName(String name);


    List<Product> findByProductNameContaining(String name);


    //Tìm product theo tên dòng sản phẩm và phân trang
    Page<Product> findByProductLineProductLineName(String productLineName, Pageable pageable);


    Page<Product> findByProductLineId(int productLineId, Pageable pageable);


    //Tính tổng sản phẩm  bán theo tháng dựa theo thương hiệu 
    @Query(value = "SELECT products.product_vendor AS productVendor, SUM(od.quantity_order) AS Total ,DATE_FORMAT(o.order_date, '%Y-%m') AS orderMonth  FROM order_details AS od INNER JOIN products ON products.id = od.product_id INNER JOIN orders AS o ON od.order_id = o.id WHERE DATE_FORMAT(o.order_date, '%Y-%m') BETWEEN :startMonth AND :endMonth GROUP BY products.product_vendor", nativeQuery=true)
    List<TotalBrandProductByMonth> getTotalBrandProductByMonth(@Param("startMonth") Date startMonth, @Param("endMonth") Date endMonth);

    public static interface TotalBrandProductByMonth{
        String getProductVendor();
        int getTotal();
    }

    //Tính tổng sản phẩm  bán theo ngày dựa theo thương hiệu 
    @Query(value = "SELECT products.product_vendor AS productVendor, SUM(od.quantity_order) AS Total, DATE(o.order_date) AS orderDate  FROM order_details AS od INNER JOIN products ON products.id = od.product_id INNER JOIN orders AS o ON od.order_id = o.id WHERE DATE(o.order_date) BETWEEN :startDate AND :endDate GROUP BY products.product_vendor", nativeQuery=true)
    List<TotalBrandProductByMonth> getTotalBrandProductByDate(@Param("startDate") Date startMonth, @Param("endDate") Date endMonth);

    public static interface TotalBrandProductByDate{
        String getProductVendor();
        int getTotal();
    }

    //Tính sản phẩm  bán theo tháng 
    @Query(value = "SELECT  DATE_FORMAT(o.order_date, '%Y-%m') AS orderMonth, products.product_name AS productName, SUM(od.quantity_order) AS Total  FROM order_details AS od INNER JOIN products ON products.id = od.product_id INNER JOIN orders AS o ON od.order_id = o.id WHERE  DATE_FORMAT(o.order_date, '%Y-%m') BETWEEN :startMonth AND :endMonth GROUP BY products.product_name ORDER BY `Total` DESC LIMIT 10", nativeQuery=true)
    List<ProductByMonth> getProductByMonth(@Param("startMonth") Date startMonth, @Param("endMonth") Date endMonth);

    public static interface ProductByMonth{
        String getProductName();
        int getTotal();
    }

    boolean existsByProductName(String productName);
    boolean existsByProductCode(String productCode);



    Product findByProductCode(String productCode);

    
    



}
