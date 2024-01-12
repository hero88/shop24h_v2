$(document).ready(function () {
   /*** REGION 1 - Global variables - Vùng khai báo biến, hằng số, tham số TOÀN CỤC */
   const gLocalhost = "http://localhost:8080";

   var gDataOrderDetail;
   var gButton;

   //Thư viện raty
   var starRating = $("#star-rating").raty({
      path: `${gLocalhost}/product-photos/`,
   });

   /*** REGION 2 - Vùng gán / thực thi sự kiện cho các elements */
   //Kiểm tra user đã đăng nhập chưa
   checkExistTokenUser();

   onPageLoading();

   //--------ĐĂNG NHẬP ĐĂNG KÝ --------------

   //Khi click vào nút Đăng xuất
   $(".logout-navbar").on("click", function () {
      localStorage.removeItem("userSigninShop24h");
      location.href = "../../../home/home.html";
   });

   //----------------------------------------------------

   //Khi click vào nút Search trên navbar
   $("#header-btnSearch").on("click", function () {
      let vValueFind = $("#header-inpSearch").val().trim();
      if (vValueFind !== "") {
         location.href = "../search/search.html?key=" + vValueFind;
      }
   });

   //Khi click vào phím đánh giá
   $("#myOrder-order").on("click", ".btn-rating", function () {
      let vLocalStorageUser = JSON.parse(localStorage.getItem("userSigninShop24h"));

      if ($(this).siblings("h1").text() == -1) {
         gButton = $(this);
         $("#rating-modal").modal("show");
         //reload raty
         starRating.raty("reload");
         $("#text-rating-content").val("");
         let vProductName = gButton.siblings(".orderDetail-productName").text();
         let vOrderDetailId = gButton.siblings(".orderDetail-id").text();
         gDataOrderDetail = {
            username: vLocalStorageUser.username,
            productName: vProductName,
            orderDetailId: vOrderDetailId,
         };
      }
   });

   //khi Click vào nút đăng trên modal raty
   $("#btn-rating-modal").click(function () {
      var ratingValue = starRating.raty("score");
      gDataOrderDetail.ratingNumber = ratingValue;
      gDataOrderDetail.content = $("#text-rating-content").val().replace(/\n/g, "<br>");

      callApiCreateRating(gDataOrderDetail);
   });

   /*** REGION 3 - Event handlers - Vùng khai báo các hàm xử lý sự kiện */
   function onPageLoading() {
      //Lấy param status ở trên url
      getParamStatusInURL();

      //Lấy Số Lượng Sản phẩm Giỏ hàng trong localStorage hiển thị số lượng lên giỏ hàng navbar
      getQuantityItemInBag();
   }

   /*** REGION 4 - Common funtions - Vùng khai báo hàm dùng chung trong toàn bộ chương trình*/

   //Gọi API thông tin chi tiết User
   function callApiDetailUser(paramHeader) {
      $.ajax({
         url: `${gLocalhost}/users/me`,
         type: "GET",
         headers: paramHeader,
         success: function (res) {
            console.log(res);
            handleAfterLoginSuccess(res);
         },
         error: function (xhr) {
            console.log(xhr);
         },
      });
   }

   //gọi Api từ phoneNumber lấy Order đang giao hàng
   function callApiOrderByStatus(paramStatus) {
      let vLocalStorageUser = JSON.parse(localStorage.getItem("userSigninShop24h"));

      $.ajax({
         async: false,
         url: `${gLocalhost}/order/orderPhoneNumber/${vLocalStorageUser.username}/${paramStatus}`,
         type: "GET",
         success: function (res) {
            console.log(res);
            if (paramStatus == "Đã Giao") {
               loadDataToDivSuccess(res);
            } else {
               loadDataToDiv(res);
            }
         },
         error: function (xhr) {
            console.log(xhr);
         },
      });
   }

   //Gọi Api tạo rating
   function callApiCreateRating(paramRating) {
      $.ajax({
         url: `${gLocalhost}/createRatingByOrderDetail`,
         type: "POST",
         contentType: "application/json",
         data: JSON.stringify(paramRating),
         success: function (res) {
            handleRatingSuccess();
         },
         error: function (xhr) {
            console.log(xhr);
         },
      });
   }

   //Lấy param status ở trên url
   function getParamStatusInURL() {
      let vUrl = new URL(window.location.href);
      let vStatusURL = vUrl.searchParams.get("status");
      //active cho thẻ a được nhấn

      $(".myOrder-navbar-item").each(function () {
         var isActive = $(this).find("h5").html() == vStatusURL;
         $(this).toggleClass("active", isActive);
      });

      //Gọi API dựa vào status đơn hàng trên URL
      callApiOrderByStatus(vStatusURL);
   }

   //Lấy Số Lượng Sản phẩm Giỏ hàng trong localStorage hiển thị số lượng lên giỏ hàng navbar
   function getQuantityItemInBag() {
      var vProductInBag = JSON.parse(localStorage.getItem("bagProduct_HH") || "[]");
      if (vProductInBag.length !== 0) {
         var vQuantityItem = 0;
         for (let bI = 0; bI < vProductInBag.length; bI++) {
            vQuantityItem += vProductInBag[bI].quantityItem;
         }
         $("#span-quantityItem").text(vQuantityItem);
      }
   }

   function loadDataToDiv(paramOrder) {
      $("#myOrder-order").html("");

      for (let bI = 0; bI < paramOrder.content.length; bI++) {
         var vOrderConfirm = "";
         let vOrder = `
               <div class="row">
                  <div class="col-12 d-flex align-items-center">
                     <h5 class=" mr-2" style="color: #009981">${paramOrder.content[bI].orderCode}</h5>
                     <h5 style="color: grey">${paramOrder.content[bI].orderDate}</h5>
                  </div>
               </div>`;

         vOrderConfirm += vOrder;

         let vOrderDetail = "";
         for (let bU = 0; bU < paramOrder.content[bI].orderDetails.length; bU++) {
            let vOrderDetailIndex = paramOrder.content[bI].orderDetails[bU];
            vOrderDetail += `
               <div class="row my-1 " style"border: 1px soild black">
                  <div class="col-4 col-sm-2">
                  <a href="../product/product.html?name=${vOrderDetailIndex.productName}">
                     <img
                        src="${gLocalhost}/product-photos/${vOrderDetailIndex.firstProductImg}"
                        alt=""
                        class="img-fluid"
                     />
                  </a>
                  </div>
                  <div class="col-8 col-sm-10">
                     <h5>${vOrderDetailIndex.productName}</h5>
                     <h6>Số Lượng : ${vOrderDetailIndex.quantityOrder}</h6>
                     <h5 style="color:red">${vOrderDetailIndex.priceEach.toLocaleString()}đ</h5>
                  </div>
               </div>
            `;
         }

         vOrderConfirm += vOrderDetail;

         let vPriceOrder = `
            <div class="row mt-2" >
                <div class="col-12">
                    <h5 style="float: right">Thành Tiền: <span class="text-danger">${paramOrder.content[
                       bI
                    ].totalPriceOrder.toLocaleString()}đ <span></h5>
                </div>
            </div>
            `;

         vOrderConfirm += vPriceOrder;

         $("#myOrder-order").append(`<div class="order-item mt-5 bg-white p-3">${vOrderConfirm}</div>`);
      }

      // Hiển thị phân trang
      // Nếu tổng trang trên 1 thì hiển thị phân trang
      if (paramOrder.totalPages > 1) {
         let pagination = $(`
               <div class="col-12 text-center my-5">
                  <ul class='pagination justify-content-center'></ul>
               </div>

            `);
         for (let i = 0; i < paramOrder.totalPages; i++) {
            let pageNumber = i + 1;
            let isActive = i == paramOrder.number;
            let pageItemClass = isActive ? "active" : "";

            var pageItem = $(
               `<li class="page-item ${pageItemClass}"><a class="page-link" href="#" >${pageNumber}</a></li>`
            );
            pageItem.find("a").on("click", function (event) {
               event.preventDefault();
               callApiOrderStatusPage(i);
            });

            pageItem.appendTo(pagination.find("ul"));
         }
         $("#myOrder-order").append(pagination);
      }
   }

   function loadDataToDivSuccess(paramOrder) {
      $("#myOrder-order").html("");

      for (let bI = 0; bI < paramOrder.content.length; bI++) {
         var vOrderConfirm = "";
         let vOrder = `
             <div class="row">
                <div class="col-12 d-flex align-items-center">
                   <h5 class=" mr-2" style="color: #009981">${paramOrder.content[bI].orderCode}</h5>
                   <h5 style="color: grey">${paramOrder.content[bI].orderDate}</h5>
                </div>
             </div>`;

         vOrderConfirm += vOrder;

         let vOrderDetail = "";
         for (let bU = 0; bU < paramOrder.content[bI].orderDetails.length; bU++) {
            let vOrderDetailIndex = paramOrder.content[bI].orderDetails[bU];
            let btnRatingClass = vOrderDetailIndex.rating == null ? "btn-danger" : "btn-secondary"; // check if rating is null
            let vRating = vOrderDetailIndex.rating == null ? "-1" : "1";

            vOrderDetail += `
             <div class="row my-3 " style"border: 1px soild black">
                <div class="col-4 col-sm-2">
                <a href="../product/product.html?name=${vOrderDetailIndex.productName}">
                     <img
                        src="${gLocalhost}/product-photos/${vOrderDetailIndex.firstProductImg}"
                        alt=""
                        class="img-fluid"
                     />
                  </a>
                </div>
                <div class="col-8 col-sm-10">
                   <h1 class="d-none">${vRating}</h1>
                   <h5 class="orderDetail-id d-none">${vOrderDetailIndex.id}</h5>
                   <h5 class="orderDetail-productName">${vOrderDetailIndex.productName}</h5>
                   <h6>Số Lượng : ${vOrderDetailIndex.quantityOrder}</h6>
                   <h5 style="color:red">${vOrderDetailIndex.priceEach.toLocaleString()}đ</h5>
                   <button class="btn ${btnRatingClass} btn-rating">Đánh Giá</button>
                </div>
             </div>
          `;
         }

         vOrderConfirm += vOrderDetail;

         let vPriceOrder = `
          <div class="row mt-2" >
              <div class="col-12">
                  <h5 style="float: right">Thành Tiền: <span class="text-danger">${paramOrder.content[
                     bI
                  ].totalPriceOrder.toLocaleString()}đ <span></h5>
              </div>
          </div>
          `;

         vOrderConfirm += vPriceOrder;

         $("#myOrder-order").append(`<div class="order-item mt-5 bg-white p-3">${vOrderConfirm}</div>`);
      }

      // Hiển thị phân trang
      // Nếu tổng trang trên 1 thì hiển thị phân trang
      if (paramOrder.totalPages > 1) {
         let pagination = $(`
               <div class="col-12 text-center my-5">
                  <ul class='pagination justify-content-center'></ul>
               </div>

            `);
         for (let i = 0; i < paramOrder.totalPages; i++) {
            let pageNumber = i + 1;
            let isActive = i == paramOrder.number;
            let pageItemClass = isActive ? "active" : "";

            var pageItem = $(
               `<li class="page-item ${pageItemClass}"><a class="page-link" href="#" >${pageNumber}</a></li>`
            );
            pageItem.find("a").on("click", function (event) {
               event.preventDefault();
               callApiOrderStatusPage(i);
            });

            pageItem.appendTo(pagination.find("ul"));
         }
         $("#myOrder-order").append(pagination);
      }
   }

   function callApiOrderStatusPage(paramPageIndex) {
      let vLocalStorageUser = JSON.parse(localStorage.getItem("userSigninShop24h"));
      let vUrl = new URL(window.location.href);
      let vStatusURL = vUrl.searchParams.get("status");

      $.ajax({
         async: false,
         url: `${gLocalhost}/order/orderPhoneNumber/${vLocalStorageUser.username}/${vStatusURL}?page=${paramPageIndex}`,
         type: "GET",
         success: function (res) {
            console.log(res);
            if (vStatusURL == "Đã Giao") {
               loadDataToDivSuccess(res);
            } else {
               loadDataToDiv(res);
            }
         },
         error: function (xhr) {
            console.log(xhr);
         },
      });
   }

   //Xử lý khi đánh giá thành công
   function handleRatingSuccess() {
      gButton.removeClass("btn-danger");
      gButton.addClass("btn-secondary");
      gButton.siblings("h1").text(1);
      $("#notice-modal").modal("show");
      $("#rating-modal").modal("hide");
      setTimeout(function () {
         $("#notice-modal").modal("hide");
      }, 2000); // 2 seconds delay
   }

   //Kiểm tra user đăng nhập
   function checkExistTokenUser() {
      var vLocalStorageUser = JSON.parse(localStorage.getItem("userSigninShop24h"));
      if (vLocalStorageUser != null) {
         gHeader = {
            Authorization: "Bearer " + vLocalStorageUser.accessToken,
         };

         //Lấy Thông tin user từ mã token
         callApiDetailUser(gHeader);
      }
   }

   //Xử lý nếu đăng nhập thành Công
   function handleAfterLoginSuccess(paramData) {
      $(".signUp-navbar").hide();
      $(".signIn-navbar").hide();
      $(".logout-navbar").show();
      $(".info-navbar").show();
      $(".myOrder-navbar").show();
      //lấy họ tên khách hàng làm avartar
      let vStr = paramData.fullNameCustomer.split(" ");
      let vLastElement = vStr[vStr.length - 1];
      let vFirstChar = vLastElement[0].toUpperCase();

      $("#navbarDropdown").html(
         `<span id="avatar-navbar" style="font-size: 1.5rem; font-weight:bold ;color: red; background-color: #FFA88C; " class="rounded-circle px-2">${vFirstChar}</span>`
      );

      var vAdminOrModerator = paramData.roles.some(
         (item) => item.name == "ROLE_MODERATOR" || item.name == "ROLE_ADMIN"
      );
      if (vAdminOrModerator) {
         $(".pageAdmin-navbar").show();
      }
   }
});
