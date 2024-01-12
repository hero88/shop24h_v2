//---------------------- INPUT NUMBER --------------------------
function formatNumber(input) {
   var num = input.value.replace(/\D/g, "");
   var formattedNum = Number(num).toLocaleString("en");
   input.value = formattedNum;
}

$(document).ready(function () {
   /*** REGION 1 - Global variables - Vùng khai báo biến, hằng số, tham số TOÀN CỤC */

   const gLocalhost = "http://localhost:8080";

   var gHeader;
   var isErrorDisplay = true;
   var isErrorDisplaySignin = true;
   var gDataFind;
   var isErrorSearchPrice = true;
   var isErrorSignUp = true;
   var isErrorSignIn = true;

   /*** REGION 2 - Vùng gán / thực thi sự kiện cho các elements */
   //Kiểm tra user đã đăng nhập chưa
   checkExistTokenUser();

   onPageLoading();

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

   //Khi click vào nút Search trên navbar
   $("#header-btnSearch").on("click", function () {
      let vValueFind = $("#header-inpSearch").val().trim();
      if (vValueFind !== "") {
         location.href = `../../../search/search.html`;
      }
   });

   //Khi click vào nút tìm kiếm trong div tìm kiếm
   $("#btn-find").on("click", function () {
      //thu thập thông tin tìm kiếm
      var vDataFind = getDataFind();
      //Kiểm tra khoảng giá nhập vào phù hợp không ?
      let vValidate = validatePriceSearch(vDataFind, $(this));
      if (vValidate) {
         //Ẩn main-search và overlay
         $("#overlay-screen").hide();
         $("#main-search").hide();

         //Gọi API tìm kiếm sản phẩm theo giá trị trong hộp thoại tìm kiếm trả về trang đầu tiên
         callApiFindProduct(vDataFind, 0);
      }
   });

   //Khi Click vào nút Ẩn Hiện Phần search
   $("#btn-controlSearchMobile").on("click", function () {
      if ($("#main-search").is(":visible")) {
         $("#main-search").fadeOut(300);
         $("#overlay-screen").fadeOut(300);
      } else {
         $("#main-search").fadeIn(300);
         $("#overlay-screen").fadeIn(300);
      }
   });

   //Khi click vào overlay screen sẽ tắt nó
   $("#overlay-screen").on("click", function () {
      $(this).hide();
      $("#main-search").hide();
   });

   //Khi Click vào nút Đóng ở main-search mobile
   $("#btn-closedMainSearch").on("click", function () {
      $("#main-search").hide();
      $("#overlay-screen").hide();
   });

   /*** REGION 3 - Event handlers - Vùng khai báo các hàm xử lý sự kiện */
   //Khi load trang thành công
   function onPageLoading() {
      //Lấy số lượng Product lưu trong Localstorage
      getQuantityItemInBag();

      //xử lý key value trên url
      handleKeyOnUrl();
   }

   //xử lý key value trên url
   function handleKeyOnUrl() {
      //Láy key Value trên Url
      let vUrlString = window.location.href;
      let vUrl = new URL(vUrlString);
      let vKeyValue = vUrl.searchParams.get("key");
      let vListValue = vUrl.searchParams.get("list");
      let vPage = vUrl.searchParams.get("page");

      if (vKeyValue != null && vListValue == null) {
         if (vPage == null) {
            vPage = 1;
         }
         //Gọi API tất cả sản phẩm nêu người dùng truyền giá trị tìm kiếm
         callApiNavbarSearch(vKeyValue, vPage);
      }

      if (vKeyValue == null && vListValue != null) {
         if (vPage == null) {
            vPage = 1;
         }
         //Gọi API sản phẩm theo dòng sản phẩm nếu người dùng click vào danh mục sản phẩm
         callApiProductLineInList(vListValue, vPage);
      }
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

   //Gọi API tạo user với customer theo user
   function callApiCreateUser(paramInfo) {
      $.ajax({
         type: "POST",
         url: `${gLocalhost}/signupCilent`,
         contentType: "application/json",
         data: JSON.stringify(paramInfo),
         success: function (res) {
            alert(res.message);
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
            handleAfterLoginSuccess(res);
         },
         error: function (xhr) {
            console.log(xhr);
         },
      });
   }

   //Gọi API tất cả sản phẩm theo tên sản phẩm nếu người dùng truyền từ thanh tìm kiếm
   function callApiNavbarSearch(paramProductName, paramPage) {
      let vPage = paramPage - 1;

      $.ajax({
         url: `${gLocalhost}/productByKeyName?name=${paramProductName}&page=${vPage}`,
         type: "GET",
         success: function (res) {
            console.log(res);
            loadProductToFind(res, paramProductName, "searchNavbar");
         },
         error: function (xhr) {
            console.log(xhr);
         },
      });
   }

   //Gọi API sản phẩm theo dòng sản phẩm nếu người dùng click vào danh mục sản phẩm
   function callApiProductLineInList(paramProductLineName, paramPage) {
      let vPage = paramPage - 1;
      $.ajax({
         url: `${gLocalhost}/productByProductLineName/${paramProductLineName}?page=${vPage}`,
         type: "GET",
         success: function (res) {
            loadProductToFind(res, paramProductLineName, "searchList");
         },
         error: function (xhr) {
            console.log(xhr);
         },
      });
   }

   //Gọi API tìm kiếm sản phẩm theo giá trị trong hộp thoại tìm kiếm
   function callApiFindProduct(paramKeyValue, paramPage) {
      $.ajax({
         url: `${gLocalhost}/product/search?keyValue=${paramKeyValue.keyValue}&keyBrand=${encodeURIComponent(
            paramKeyValue.keyBrand.join(",")
         )}&keyLine=${encodeURIComponent(paramKeyValue.keyLine.join(","))}&keyPrice=${encodeURIComponent(
            paramKeyValue.keyPrice.join(",")
         )}&page=${paramPage}`,

         type: "GET",
         contentType: "application/json",
         success: function (res) {
            console.log(res);
            loadProductToFind(res, "", "searchMain");
         },
         error: function (xhr) {
            console.log(xhr);
         },
      });
   }

   //Lấy số lượng Product lưu trong Localstorage
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

   //Lấy Thông tin tìm kiếm
   function getDataFind() {
      let vDataFind = {};
      //Lấy Giá trị ở từ khóa
      vDataFind.keyValue = $("#inp-keyValue").val();
      // Lấy các giá trị đã được chọn của ô đánh dấu checkbox Thương Hiệu
      vDataFind.keyBrand = [];
      $('input[name="checkboxBrand"]:checked').each(function () {
         vDataFind.keyBrand.push($(this).val());
      });
      // Lấy các giá trị đã được chọn của ô đánh dấu checkbox ở Dòng
      vDataFind.keyLine = [];
      $('input[name="checkboxLine"]:checked').each(function () {
         vDataFind.keyLine.push($(this).val());
      });
      //Lấy giá trị ở ô Giá

      let vPriceStartOriginal = $("#inp-keyPriceStart").val();
      let vPriceStart = vPriceStartOriginal.replace(/,/g, "");
      let vPriceEndOriginal = $("#inp-keyPriceEnd").val();
      let vPriceEnd = vPriceEndOriginal.replace(/,/g, "");
      vDataFind.keyPrice = [vPriceStart, vPriceEnd];
      gDataFind = vDataFind;
      return vDataFind;
   }

   //Load sản phẩm theo danh mục
   function loadProductToFind(paramProduct, paramNameFind, paramSearch) {
      $("#wrapper-findProduct").html("");

      $("#wrapper-findProduct").append(`
         <div class="col-12">   
            <p style="font-size: 20px; font-weight: bold">Tìm Kiếm (${paramProduct.totalElements} sản phẩm)</p>
            <hr>
         </div>
      `);

      if (paramProduct.content.length == 0) {
         $("#wrapper-findProduct").append(`
            <div class="col-12 text-center">   
               <p style="color: red; font-size: 20px">Không tìm thấy sản phẩm</p>
            </div>
         `);
      } else {
         let vProductIndex = paramProduct.content;
         for (let bI = 0; bI < vProductIndex.length; bI++) {
            let vNumberFormat = vProductIndex[bI].buyPrice.toLocaleString();
            $("#wrapper-findProduct").append(
               `<div class="col-lg-3 col-md-4 col-sm-6 col-6 pt-3 mobile-item" style="cursor: pointer;">
            <a href="../product/product.html?name=${vProductIndex[bI].productName}" style="text-decoration: none">
               <div class="card" style="border: none; height: 350px">
                  <div>
                     <img
                        class="card-img-top "
                        src="${gLocalhost}/product-photos/${vProductIndex[bI].productImg[0]}"
                        alt="Card image cap"
                        style = " object-fit: contain; width:100%; padding: 10px; height: 200px"                     
                     />
                  </div>
                  <div class="card-body text-center">
                     <div style="height:4.5rem">
                        <p class="product-name" style="color: black" >${vProductIndex[bI].productName}</p>
                     </div> 
                     <p class="product-price" >${vNumberFormat} đ</p>
                  </div>
               </div>
               </a>
            </div>`
            );
         }

         // Hiển thị phân trang
         // Nếu tổng trang trên 1 thì hiển thị phân trang
         if (paramProduct.totalPages > 1) {
            let pagination = $(`
               <div class="col-12 text-center my-5">
                  <ul class='pagination justify-content-center'></ul>
               </div>

            `);
            for (let i = 0; i < paramProduct.totalPages; i++) {
               let pageNumber = i + 1;
               let isActive = i == paramProduct.number;
               let pageItemClass = isActive ? "active" : "";

               //Nếu search trên Navbar
               if (paramSearch == "searchNavbar") {
                  var pageItem = $(
                     `<li class="page-item ${pageItemClass}"><a class="page-link" href="../search/search.html?key=${paramNameFind}&page=${pageNumber}" >${pageNumber}</a></li>`
                  );
               }

               //Nếu search trên Danh mục
               if (paramSearch == "searchList") {
                  var pageItem = $(
                     `<li class="page-item ${pageItemClass}"><a class="page-link" href="../search/search.html?list=${paramNameFind}&page=${pageNumber}" >${pageNumber}</a></li>`
                  );
               }

               //Nếu search trong phần main thì gán sự kiện gọi APi trong các trang
               if (paramSearch == "searchMain") {
                  var pageItem = $(
                     `<li class="page-item ${pageItemClass}"><a class="page-link" href="#" >${pageNumber}</a></li>`
                  );
                  pageItem.find("a").on("click", function (event) {
                     event.preventDefault();
                     callApiFindProduct(gDataFind, i);
                  });
               }

               pageItem.appendTo(pagination.find("ul"));
            }
            $("#wrapper-findProduct").append(pagination);
         }
      }
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

   //Kiểm tra khoảng giá nhập vào phù hợp không?
   function validatePriceSearch(paramData, paramButton) {
      let vPriceStart = $("#inp-keyPriceStart");
      let vPriceEnd = $("#inp-keyPriceEnd");

      // Thêm sự kiện blur cho trường khoảng giá bắt đầu
      vPriceStart.on("input", function () {
         // Xóa thẻ <p> hiển thị lỗi
         $(this).closest("#price-search").find("p").remove();
         isErrorSearchPrice = true;
      });

      // Thêm sự kiện blur cho trường khoảng giá kết thúc
      vPriceEnd.on("input", function () {
         // Xóa thẻ <p> hiển thị lỗi
         $(this).closest("#price-search").find("p").remove();
         isErrorSearchPrice = true;
      });

      if (parseInt(paramData.keyPrice[0]) > parseInt(paramData.keyPrice[1])) {
         if (isErrorSearchPrice) {
            paramButton
               .closest("#main-search")
               .find("#price-search")
               .append(`<p style="color:red; font-size: 0.8rem">Nhập khoảng giá phù hợp</p>`);
            isErrorSearchPrice = false;
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
});
