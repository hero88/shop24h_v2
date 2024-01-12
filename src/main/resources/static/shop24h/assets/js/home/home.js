$(document).ready(function () {
   /*** REGION 1 - Global variables - Vùng khai báo biến, hằng số, tham số TOÀN CỤC */
   const gLocalhost = "http://localhost:8080";

   var gHeader;
   var isErrorDisplay = true;
   var isErrorDisplaySignin = true;
   var isErrorSignUp = true;
   var isErrorSignIn = true;

   /*** REGION 2 - Vùng gán / thực thi sự kiện cho các elements */
   onPageLoading();

   //Kiểm tra user đã đăng nhập chưa
   checkExistTokenUser();

   //Khi click vào Đăng nhập
   $(".signIn-navbar").on("click", function () {
      $("#signIn-modal").modal("show");
   });

   //Khi Click vào nút Đăng Nhập trong modal
   $("#btn-signIn-modal").on("click", function () {
      var vInfo = getInfoInSignInModal();
      var vValidate = vValidateInfoSignin(vInfo);
      if (vValidate) {
         callApiSignin(vInfo);
      }
   });

   //Khi click vào Đăng ký
   $(".signUp-navbar").on("click", function () {
      $("#inp-signUp-fullName").val("");
      $("#inp-signUp-phoneNumber").val("");
      $("#inp-signUp-email").val("");
      $("#inp-signUp-phoneNumber").val("");
      $("#inp-signUp-password").val("");
      $("#inp-signUp-confirm-password").val("");
      $("#inp-signUp-answer").val("");

      $("#signUp-modal").modal("show");
   });

   //Khi click vào nút đăng ký trong modal
   $("#btn-signUp-modal").on("click", function () {
      var vInfo = getInfoInSignUpModal();
      var vValidate = validateInfo(vInfo);
      if (vValidate) {
         callApiCreateUser(vInfo);
      }
   });

   //Khi click vào nút Đăng xuất
   $(".logout-navbar").on("click", function () {
      localStorage.removeItem("userSigninShop24h");
      location.reload();
   });

   //Khi click vào nút Search
   $("#header-btnSearch").on("click", function () {
      let vValueFind = $("#header-inpSearch").val().trim();
      if (vValueFind !== "") {
         location.href = "../search/search.html?key=" + vValueFind;
      }
   });

   /*** REGION 3 - Event handlers - Vùng khai báo các hàm xử lý sự kiện */
   //Khi load trang thành công
   function onPageLoading() {
      callApiToProductMobile();
      callApiToProductWatch();
      //Lấy Số Lượng Sản phẩm Giỏ hàng trong localStorage hiển thị số lượng lên giỏ hàng navbar
      getQuantityItemInBag();
      //gọi API những sản phẩm bán chạy nhất
      callApiBestSold();
   }

   /*** REGION 4 - Common funtions - Vùng khai báo hàm dùng chung trong toàn bộ chương trình*/
   //Gọi API sản phẩm mobile
   function callApiToProductMobile() {
      $.ajax({
         url: `${gLocalhost}/productByProductLineAndPage/1?page=0&size=8`,
         type: "GET",
         success: function (res) {
            //thành công tải vào div chứa mobile

            loadDataToDivMobile(res);
         },
         error: function (res) {
            console.log(res);
         },
      });
   }

   //Gọi API sản phẩm watch
   function callApiToProductWatch() {
      $.ajax({
         url: `${gLocalhost}/productByProductLineAndPage/2?page=0&size=8`,
         type: "GET",
         success: function (res) {
            //thành công tải vào div chứa watch
            loadDataToDivWatch(res);
            swiperWatch();
         },
         error: function (res) {
            console.log(res);
         },
      });
   }

   //Gọi API Những sản phảm bán chạy nhất
   function callApiBestSold() {
      $.ajax({
         url: `${gLocalhost}/productBestSell/6`,
         type: "GET",
         success: function (res) {
            //thành công tải vào div chứa best sell
            console.log(res);
            loadDataToBestSold(res);
            swiperBestSell();
         },
         error: function (res) {
            console.log(res);
         },
      });
   }

   //Gọi API tạo user với customer theo user
   function callApiCreateUser(paramInfo) {
      $.ajax({
         type: "POST",
         url: `${gLocalhost}/signupCilent`,
         contentType: "application/json",
         data: JSON.stringify(paramInfo),
         success: function (res) {
            $("#signUp-modal").modal("hide");
         },
         error: function (xhr) {
            if (isErrorSignUp) {
               $("#inp-signUp-phoneNumber").parent().append(`<p style="color:red">${xhr.responseJSON.message}</p>`);
               isErrorSignUp = false;
            }
         },
      });
   }

   //Gọi API đăng nhập user
   function callApiSignin(paramInfo) {
      $.ajax({
         type: "POST",
         url: `${gLocalhost}/signin`,
         contentType: "application/json",
         data: JSON.stringify(paramInfo),
         success: function (res) {
            console.log(res);
            setLocalStorageUser(res);
         },
         error: function (xhr) {
            if (isErrorSignIn) {
               $("#inp-signIn-password").parent().append(`<p style="color:red">${xhr.responseText}</p>`);
               isErrorSignIn = false;
            }
         },
      });
   }

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

   //Tải sản phẩm vào div top sold
   function loadDataToBestSold(paramProductTop) {
      for (let bI = 0; bI < paramProductTop.length; bI++) {
         let vProductIndex = paramProductTop[bI];
         $("#swiperBestChoice").append(
            `
            <div class="swiper-slide bestChoice my-3">
            <a href="../product/product.html?name=${
               vProductIndex.productName
            }" style="text-decoration: none">

               <div class="card" style="border: none">
                  <img
                     class="card-img-top"
                     src="${gLocalhost}/product-photos/${vProductIndex.productImg[0]}"
                     alt="Card image cap"
                  />
                  <div class="card-body">
                     <div style="height:8rem">
                        <div class="warrper-name">
                           <h6 class="product-name">${vProductIndex.productName}</h6>
                        </div>
                        
                        <h5 class="product-price mt-1">${vProductIndex.buyPrice.toLocaleString()} đ</h5>
                     
                        <div class="d-flex justify-content-center">
                           <div class="progress" style="width: 70%; height:25px;  border-radius: 30px">
                              <div class="progress-bar" style="width: ${(vProductIndex.productSold / 20) * 100}%"></div>
                              <div class="progress-text text-white" style="font-weight:bold">
                                 <span>${vProductIndex.productSold}/20</span>
                              </div>
                           </div>
                        </div>
                    
                     
                     </div>                    
                  </div>
               </div>
            </a>
            </div> `
         );
      }
   }

   //Tải vào div Mobile
   function loadDataToDivMobile(paramProductMobile) {
      console.log(paramProductMobile)
      for (let bI = 0; bI < paramProductMobile.length; bI++) {
         let vNumberFormat = paramProductMobile[bI].buyPrice.toLocaleString();
         $("#container-productMobile").append(
            `<div class="col-lg-3 col-md-4 col-sm-6 col-6 pt-3 mobile-item" style="cursor: pointer;">
            <a href="../product/product.html?name=${paramProductMobile[bI].productName}" style="text-decoration: none">
               <div class="card" style="border: none; height: 380px">
                  <div>
                     <img
                        class="card-img-top "
                        src="${gLocalhost}/product-photos/${paramProductMobile[bI].productImg[0]}"
                        alt="Card image cap"
                        style = " object-fit: contain; width:100%; padding: 10px; height: 250px"                     
                     />
                  </div>
                  <div class="card-body">
                     <div class="warrper-name">
                         <p class="product-name">${paramProductMobile[bI].productName}</p>
                     </div>
                     <p class="product-price ">${vNumberFormat} đ</p>
                  </div>
               </div>
               </a>
            </div>`
         );
      }
   }

   function loadDataToDivWatch(paramProductWatch) {
      for (let bI = 0; bI < paramProductWatch.length; bI++) {
         let vNumberFormat = paramProductWatch[bI].buyPrice.toLocaleString();
         $(".swiper-wrapper.watch").append(
            `<div class="swiper-slide watch watch-item">
            <a href="../product/product.html?name=${paramProductWatch[bI].productName}" style="text-decoration: none">
               <div class="card">
                  <div class="row">
                     <div class="col-sm-6 ">
                        <img
                           src="${gLocalhost}/product-photos/${paramProductWatch[bI].productImg[0]}"
                           class="card-img-top"
                           style = " object-fit: contain; width:100%; height: 200px" 

                        />
                     </div>
                     <div class="col-sm-6 py-2">
                        <div class="card-body">
                           <div style="height: 5rem"> 
                              <p class="product-name" style="color:black">${paramProductWatch[bI].productName}</p>
                           </div>
                           <p class="product-price">${vNumberFormat} đ</p>
                        </div>
                     </div>
                  </div>
               </div>
               </a>
            </div>`
         );
      }
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

   //Lấy Thông tin từ modal đăng ký
   function getInfoInSignUpModal() {
      vInfo = {};
      vInfo.fullName = $("#inp-signUp-fullName").val().trim();
      vInfo.phoneNumber = $("#inp-signUp-phoneNumber").val().trim();
      vInfo.email = $("#inp-signUp-email").val().trim();
      vInfo.username = $("#inp-signUp-phoneNumber").val().trim();
      vInfo.password = $("#inp-signUp-password").val().trim();
      vInfo.confirmPassword = $("#inp-signUp-confirm-password").val().trim();
      vInfo.secretQuestion = $("#select-signUp-question :selected").text();
      vInfo.secretAsnwer = $("#inp-signUp-answer").val();
      return vInfo;
   }

   //Lấy Thông tin từ modal Đăng Nhập
   function getInfoInSignInModal() {
      vInfo = {};
      vInfo.username = $("#inp-signIn-phoneNumber").val();
      vInfo.password = $("#inp-signIn-password").val();
      return vInfo;
   }

   //Kiểm tra thông tin modal Đăng ký
   function validateInfo(paramInfo) {
      var vFullName = $("#inp-signUp-fullName");
      var vPhoneNumber = $("#inp-signUp-phoneNumber");
      var vEmail = $("#inp-signUp-email");
      var vPassword = $("#inp-signUp-password");
      var vConfirmPassword = $("#inp-signUp-confirm-password");
      var vSecretAnswer = $("#inp-signUp-answer");

      // Thêm sự kiện blur cho trường #inp-phoneNumber
      vPhoneNumber.on("input", function () {
         if ($(this).val() != "" || !isNaN($(this).val())) {
            // Xóa thẻ <p> hiển thị lỗi
            $(this).siblings("p").remove();
            isErrorDisplay = true;
            isErrorSignUp = true;
         }
      });

      if (vPhoneNumber.val() == "" || isNaN(vPhoneNumber.val())) {
         if (isErrorDisplay) {
            vPhoneNumber
               .parent()
               .append(`<p style="color:red; font-size: 0.8rem">Nhập Số Điện Thoại và số điện thoại phải là sô</p>`);
            vPhoneNumber.focus();
            isErrorDisplay = false;
         }
         return false;
      }

      // Thêm sự kiện blur cho trường #inp-fullName
      vFullName.on("input", function () {
         if ($(this).val() != "") {
            // Xóa thẻ <p> hiển thị lỗi
            $(this).siblings("p").remove();
            isErrorDisplay = true;
         }
      });

      if (vFullName.val() == "") {
         if (isErrorDisplay) {
            vFullName.parent().append(`<p style="color:red; font-size: 0.8rem">Nhập Họ Tên</p>`);
            vFullName.focus();
            isErrorDisplay = false;
         }
         return false;
      }

      // Thêm sự kiện blur cho trường #inp-email
      vEmail.on("input", function () {
         if ($(this).val() != "") {
            // Xóa thẻ <p> hiển thị lỗi
            $(this).siblings("p").remove();
            isErrorDisplay = true;
         }
      });

      if (vEmail.val() == "") {
         if (isErrorDisplay) {
            vEmail.parent().append(`<p style="color:red; font-size: 0.8rem">Nhập Email và đúng định dạng</p>`);
            vEmail.focus();
            isErrorDisplay = false;
         }
         return false;
      }

      // Thêm sự kiện blur cho trường #inp-password
      vPassword.on("input", function () {
         if ($(this).val() != "") {
            // Xóa thẻ <p> hiển thị lỗi
            $(this).siblings("p").remove();
            isErrorDisplay = true;
         }
      });

      if (vPassword.val() == "") {
         if (isErrorDisplay) {
            vPassword.parent().append(`<p style="color:red; font-size: 0.8rem">Nhập Mật Khẩu</p>`);
            vPassword.focus();
            isErrorDisplay = false;
         }
         return false;
      }

      // Thêm sự kiện blur cho trường #inp-confirm-password
      vConfirmPassword.on("input", function () {
         if ($(this).val() != "") {
            // Xóa thẻ <p> hiển thị lỗi
            $(this).siblings("p").remove();
            if (vConfirmPassword.val() == vPassword.val()) {
               // Xóa thẻ <p> hiển thị lỗi của trường #inp-password
               vPassword.siblings("p").remove();
            }
            isErrorDisplay = true;
         }
      });

      if (vConfirmPassword.val() == "") {
         if (isErrorDisplay) {
            vConfirmPassword.parent().append(`<p style="color:red; font-size: 0.8rem">Nhập Xác nhận Mật Khẩu</p>`);
            vConfirmPassword.focus();
            isErrorDisplay = false;
         }
         return false;
      }

      if (vConfirmPassword.val() != vPassword.val()) {
         if (isErrorDisplay) {
            vConfirmPassword.parent().append(`<p style="color:red; font-size: 0.8rem">Phải giống mật khẩu đăng ký</p>`);
            vConfirmPassword.focus();
            isErrorDisplay = false;
         }
         return false;
      }

      // Thêm sự kiện blur cho trường #inp-answer
      vSecretAnswer.on("input", function () {
         if ($(this).val() != "") {
            // Xóa thẻ <p> hiển thị lỗi
            $(this).siblings("p").remove();
            isErrorDisplay = true;
         }
      });

      if (vSecretAnswer.val() == "") {
         if (isErrorDisplay) {
            vSecretAnswer.parent().append(`<p style="color:red; font-size: 0.8rem">Nhập Câu trả lời bí mật</p>`);
            vSecretAnswer.focus();
            isErrorDisplay = false;
         }
         return false;
      }

      return true;
   }

   //Kiểm tra thông tin modal Đăng Nhập
   function vValidateInfoSignin(paramInfo) {
      var vUsername = $("#inp-signIn-phoneNumber");
      var vPassword = $("#inp-signIn-password");

      // Thêm sự kiện blur cho trường #inp-phoneNumber
      vUsername.on("input", function () {
         if ($(this).val() != "" || !isNaN($(this).val())) {
            // Xóa thẻ <p> hiển thị lỗi
            $(this).siblings("p").remove();
            isErrorDisplaySignin = true;
            isErrorSignIn = true;
         }
      });

      if (vUsername.val() == "" || isNaN(vUsername.val())) {
         if (isErrorDisplaySignin) {
            vUsername
               .parent()
               .append(`<p style="color:red; font-size: 0.8rem">Nhập Số Điện Thoại và số điện thoại phải là sô</p>`);
            vUsername.focus();
            isErrorDisplaySignin = false;
            isErrorSignIn = true;
         }
         return false;
      }

      // Thêm sự kiện blur cho trường #inp-password
      vPassword.on("input", function () {
         if ($(this).val() != "") {
            // Xóa thẻ <p> hiển thị lỗi
            $(this).siblings("p").remove();
            isErrorDisplaySignin = true;
         }
      });

      if (vPassword.val() == "") {
         if (isErrorDisplaySignin) {
            vPassword.parent().append(`<p style="color:red; font-size: 0.8rem">Nhập Mật Khẩu</p>`);
            vPassword.focus();
            isErrorDisplaySignin = false;
         }
         return false;
      }

      return true;
   }

   //Lưu user vào localstorage
   function setLocalStorageUser(paramData) {
      $("#signIn-modal").modal("hide");
      localStorage.setItem("userSigninShop24h", JSON.stringify(paramData));
      location.reload();
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

   function swiperWatch() {
      var swiper = new Swiper(".swiper-container.watch", {
         pagination: {
            el: ".swiper-pagination.watch",
            clickable: true,
         },
         navigation: {
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev",
         },
         breakpoints: {
            // Thiết lập khi màn hình có chiều rộng <= 1200px
            800: {
               slidesPerView: 2,
               slidesPerColumn: 2,
               slidesPerColumnFill: "row",
               slidesPerGroup: 4,
               spaceBetween: 50,
            },
            300: {
               slidesPerView: 2,
               slidesPerGroup: 2,
               spaceBetween: 30,
            },
         },
      });
   }

   function swiperBestSell() {
      var swiper = new Swiper(".swiper-container.bestChoice", {
         pagination: {
            el: ".swiper-pagination.bestChoice",
            clickable: true,
         },
         breakpoints: {
            300: {
               slidesPerView: 2,
               spaceBetween: 20,
            },

            720: {
               slidesPerView: 3,
               spaceBetween: 10,
            },

            1200: {
               slidesPerView: 4,
               spaceBetween: 30,
            },
         },
      });
   }
});
