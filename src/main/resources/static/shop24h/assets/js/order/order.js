$(document).ready(function () {
   /*** REGION 1 - Global variables - Vùng khai báo biến, hằng số, tham số TOÀN CỤC */

   const gLocalhost = "http://localhost:8080";

   var gHeader;
   var isErrorDisplay = true;
   var isErrorDisplaySignin = true;
   var isErrorSignUp = true;
   var isErrorSignIn = true;
   var isErrorDisplayChange = true;

   /*** REGION 2 - Vùng gán / thực thi sự kiện cho các elements */
   onPageLoading();

   //Kiểm tra user đã đăng nhập chưa
   checkExistTokenUser();

   //SỰ KIỆN ĐĂNG KÝ VÀ ĐĂNG NHẬP VÀ SEARCH
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
         location.href = "../search/search.html?key=" + vValueFind;
      }
   });

   //CAC SỰ KIỆN TRONG ITEM (TĂNG, GIẢM, INPUT, XÓA ) ---------------------------------
   //sự kiện click cho phím plus tăng đơn vị  nhưng không lớn hơn quantityInStock
   //Thay đổi giá tổng và giỏ hàng trên cilent
   $(".fa-circle-plus").on("click", function () {
      var currentVal = parseInt($(this).siblings(".inp-quantityItem").val());
      var vQantityInStock = parseInt($(this).closest(".card-item").find(".span-quantityInStock").text());

      if (currentVal < vQantityInStock) {
         $(this)
            .siblings(".inp-quantityItem")
            .val(currentVal + 1);
      } else {
         $(this).siblings(".inp-quantityItem").val(vQantityInStock);
      }

      //thay đổi số lượng giở hàng và tổng tiền trên cilent
      getTotalItemAndPrice(
         $(this).closest(".card-item").find("h5").text(),
         $(this).siblings(".inp-quantityItem").val()
      );
   });

   //sự kiện click phím minus giảm đơn vị  nhưng không nhỏ hơn 1
   //Sự kiện khi thẻ input thay đổi tính tổng giá trị item và item trên giỏ hàng cilent
   $(".fa-circle-minus").on("click", function () {
      var currentVal = parseInt($(this).siblings(".inp-quantityItem").val());
      if (currentVal > 1) {
         $(this)
            .siblings(".inp-quantityItem")
            .val(currentVal - 1);
      } else {
         $(this).siblings(".inp-quantityItem").val(1);
      }

      getTotalItemAndPrice(
         $(this).closest(".card-item").find("h5").text(),
         $(this).siblings(".inp-quantityItem").val()
      );
   });

   //Sự kiện khi thẻ input thay đổi tính tổng giá trị item và item trên giỏ hàng cilent
   $(".inp-quantityItem").on("change", function () {
      var vValueInput = parseInt($(this).val());
      var vQantityInStock = parseInt($(this).closest(".card-item").find(".span-quantityInStock").text());

      if (isNaN(vValueInput) || vValueInput == 0) {
         $(this).val(1);
      }

      if (vValueInput > vQantityInStock) {
         $(this).val(vQantityInStock);
      }
      getTotalItemAndPrice($(this).closest(".card-item").find("h5").text(), $(this).val());
   });

   //Sự kiện click nút xóa item
   $(".fa-square-minus").on("click", function () {
      // Lấy mảng sản phẩm từ localStorage
      var vProductInBag = JSON.parse(localStorage.getItem("bagProduct_HH") || "[]");

      // Lấy tên sản phẩm được bấm nút trừ
      var vNameProDuctInItem = $(this).closest(".card-item").find("h5").text();

      // Lọc mảng sản phẩm không chứa sản phẩm bị xóa
      var vProductAdd = vProductInBag.filter((item) => item.gProduct.productName !== vNameProDuctInItem);

      // Xóa sản phẩm khỏi giỏ hàng
      $(this).closest(".card-item").remove();

      // Lưu lại mảng sản phẩm mới vào localStorage
      localStorage.setItem("bagProduct_HH", JSON.stringify(vProductAdd));
      vProductInBag = JSON.parse(localStorage.getItem("bagProduct_HH" || "[]"));

      // Cập nhật tổng số lượng sản phẩm và giá trị đơn hàng
      var vToTalPrice = 0;
      var vTotalQuantityItemInBag = 0;
      for (product of vProductInBag) {
         vTotalQuantityItemInBag += Number(product.quantityItem);
         vToTalPrice += Number(product.quantityItem) * Number(product.gProduct.buyPrice);
      }
      $("#span-quantityItem").text(vTotalQuantityItemInBag);
      $("#total-priceOrder").text(vToTalPrice.toLocaleString() + " đ");

      // Nếu không còn sản phẩm trong giỏ hàng, hiển thị thông báo
      if (vToTalPrice == 0) {
         $(".main-noItem").removeClass("d-none");
         $(".main-info").addClass("d-none");
         $(".main-item").addClass("d-none");
      }
   });

   //-------------------------------------------------------------------------------

   //SỰ KIỆN TRONG FORM ĐĂNG KÝ THÔNG TIN
   //sự kiện khi click nút đặt hàng
   $("#btn-confirm").on("click", function () {
      //Lấy Thông tin từ Form đặt hàng
      let vInfo = getInfoToFormOrder();
      //Kiểm tra thông tin từ form đặt hàng
      if (validateOrderInfo()) {
         //Tạo Order cho Khách hàng
         createOrderOfCustomer(vInfo);
      }
   });

   //Khi select province thay đổi, load dữ liệu quận vào
   $("#select-province").on("change", function () {
      //Xóa select ward
      let vWard = $("#select-ward");
      vWard.empty();
      vWard.append(`<option value=0>Phường, Xã</option>`);

      //Gọi Api district theo provinceId
      let vDistrict = $("#select-district");
      vDistrict.empty();
      callApiDistrictByProvinceId($(this).val());
   });

   //Khi select district thay đổi, load dữ liệu phường vào
   $("#select-district").on("change", function () {
      //Gọi Api district theo provinceId
      let vWard = $("#select-ward");
      vWard.empty();
      callApiWardByDistrictId($(this).val());
   });

   /*** REGION 3 - Event handlers - Vùng khai báo các hàm xử lý sự kiện */
   function onPageLoading() {
      loadDataFormProductInBag();
      callApiAllProvince();
   }

   /*** REGION 4 - Common funtions - Vùng khai báo hàm dùng chung trong toàn bộ chương trình*/
   //CÁC LỆNH CALL API-----------------------------------------------------------------

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

   //Gọi API all province
   function callApiAllProvince() {
      $.ajax({
         type: "GET",
         url: `${gLocalhost}/provinces`,
         success: function (res) {
            loadDataToSelectProvince(res);
         },
      });
   }

   //Gọi API District By ProvinceId
   function callApiDistrictByProvinceId(paramProvinceId) {
      $.ajax({
         type: "GET",
         url: `${gLocalhost}/districts/${paramProvinceId}`,
         success: function (res) {
            loadDataToSelectDistrict(res);
         },
      });
   }

   //Gọi API Ward By DistrictId
   function callApiWardByDistrictId(paramDistrictId) {
      $.ajax({
         type: "GET",
         url: `${gLocalhost}/wards/${paramDistrictId}`,
         success: function (res) {
            loadDataToSelectWard(res);
         },
      });
   }

   // ------------------------------------------------------------------------------------
   //Tải dữ liệu từ localStorage vào cilent
   function loadDataFormProductInBag() {
      var vProductInBag = JSON.parse(localStorage.getItem("bagProduct_HH") || "[]");

      if (vProductInBag.length != 0) {
         $(".main-noItem").addClass("d-none");
         $(".main-info").removeClass("d-none");
         $(".main-item").removeClass("d-none");

         for (product of vProductInBag) {
            $(".main-item").append(
               `<div class="row card-item mb-4" style="position:relative">
               <span style="position: absolute; right:15px; z-index: 100;padding: 2px; color:red; cursor: pointer" ><i class="fa-solid fa-square-minus"></i></span>
               
                <div class="col-sm-3 col-4">
                   <img src="${gLocalhost}/product-photos/${
                      product.gProduct.productImg[0]
                   }" alt="" class="img-fluid" />
                </div>
                <div class="col-sm-9 col-8">
                   <h5>${product.gProduct.productName}</h5>
                   <h6 style="color: red"><strong> ${product.gProduct.buyPrice.toLocaleString()} đ </strong></h6>
                   <div class="d-flex align-items-center">
                      <i class="fa-solid fa-circle-minus " style="font-size: 1.5rem; cursor: pointer"></i>
                      <input
                         type="text"
                         class="form-control mx-2 text-center inp-quantityItem"
                         style="width: 80px"
                         value="${product.quantityItem}"
                         onkeypress="return event.charCode >= 48 && event.charCode <= 57"
                      />
                      <i class="fa-sharp fa-solid fa-circle-plus " style="font-size: 1.5rem; cursor: pointer"></i>
                   </div>
                   <div class="d-flex">
                   <p class="mt-2">Sản phẩm có sẵn:&nbsp</p>
                   <p class="span-quantityInStock mt-2">${product.gProduct.quantityInStock}</p>
                   </div>
                </div>
             </div>`
            );
         }

         $(".main-item").append(`
            <div class="row card-item mb-4 " style="position:relative">
                <div class="col-12 p-2>
                    <div class="d-flex"> 
                        <h5 > Tổng Thanh Toán:&nbsp<strong id="total-priceOrder" style="color:red">10,000,0000</strong></h5>                   
                    </div>
                </div>
            </div>
         `);

         // Cập nhật tổng số lượng sản phẩm và giá trị đơn hàng
         var vToTalPrice = 0;
         var vTotalQuantityItemInBag = 0;
         for (product of vProductInBag) {
            vTotalQuantityItemInBag += Number(product.quantityItem);
            vToTalPrice += Number(product.quantityItem) * Number(product.gProduct.buyPrice);
         }
         $("#span-quantityItem").text(vTotalQuantityItemInBag);
         $("#total-priceOrder").text(vToTalPrice.toLocaleString() + " đ");
      }
   }

   //Tải dữ liệu vào select Province
   function loadDataToSelectProvince(paramProvince) {
      $("#select-province").append(
         $("<option>", {
            text: "Tỉnh, Thành Phố",
            value: 0,
         })
      );

      for (let bI = 0; bI < paramProvince.length; bI++) {
         $("#select-province").append(
            $("<option>", {
               text: paramProvince[bI].name,
               value: paramProvince[bI].id,
            })
         );
      }
   }

   //Tải dữ liệu vào select District theo ProvinceId
   function loadDataToSelectDistrict(paramDistrict) {
      let vDistrict = $("#select-district");
      vDistrict.append(`<option value=0>Quận, Huyện</option>`);
      paramDistrict.forEach((district) => vDistrict.append(`<option value=${district.id}>${district.name}</option>`));
   }

   //Tải dữ liệu vào select District theo ProvinceId
   function loadDataToSelectWard(paramWard) {
      let vWard = $("#select-ward");
      vWard.append(`<option value=0>Phường, Xã</option>`);
      paramWard.forEach((ward) => vWard.append(`<option value=${ward.id}>${ward.name}</option>`));
   }

   //-------------------------------------------------------------------
   //Tính tổng tiền và số lượng item giỏ hàng trên cilent
   function getTotalItemAndPrice(paramProductName, paramInputQuantity) {
      // Lấy mảng sản phẩm từ localStorage
      var vProductInBag = JSON.parse(localStorage.getItem("bagProduct_HH") || "[]");

      //Cập nhật số lượng sản phẩm từ mảng sản phẩm mới lấy ra
      for (product of vProductInBag) {
         if (product.gProduct.productName == paramProductName) {
            product.quantityItem = Number(paramInputQuantity);
            break;
         }
      }
      // Cập nhật tổng số lượng sản phẩm và giá trị đơn hàng
      var vTotalQuantityItemInBag = 0;
      var vToTalPrice = 0;
      localStorage.setItem("bagProduct_HH", JSON.stringify(vProductInBag));
      for (product of vProductInBag) {
         vTotalQuantityItemInBag += Number(product.quantityItem);
         vToTalPrice += Number(product.quantityItem) * Number(product.gProduct.buyPrice);
      }
      $("#span-quantityItem").text(vTotalQuantityItemInBag);
      $("#total-priceOrder").text(vToTalPrice.toLocaleString() + " đ");
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

      if (vProductInBag.length == 0) {
         $("#span-quantityItem").text("0");
      }
   }

   //Lấy Thông tin từ Form đặt hàng
   function getInfoToFormOrder() {
      let vInfoArray = [];

      // Tạo đối tượng 1
      let vInfoCustomer = {};
      vInfoCustomer.fullName = $("#inp-fullName").val().trim();
      vInfoCustomer.phoneNumber = $("#inp-phoneNumber").val().trim();
      vInfoCustomer.email = $("#inp-email").val().trim();
      vInfoArray.push(vInfoCustomer);

      // Tạo đối tượng 2
      let vInfoOrder = {};
      vInfoOrder.provinceId = $("#select-province").val();
      vInfoOrder.districtId = $("#select-district").val();
      vInfoOrder.wardId = $("#select-ward").val();
      vInfoOrder.address = $("#inp-address").val();
      vInfoOrder.comments = $("#textarea-note").val().trim();
      vInfoOrder.status = "Chờ Xác Nhận";
      vInfoArray.push(vInfoOrder);

      return vInfoArray;
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

   //Kiểm tra thông tin từ form đặt hàng
   function validateOrderInfo() {
      var vFullName = $("#inp-fullName");
      var vPhoneNumber = $("#inp-phoneNumber");
      var vEmail = $("#inp-email");
      var vProvince = $("#select-province");
      var vDistrict = $("#select-district");
      var vWard = $("#select-ward");
      var vAddress = $("#inp-address");

      // Thêm sự kiện blur cho trường #inp-fullName
      vFullName.on("blur", function () {
         if ($(this).val() != "") {
            // Xóa thẻ <p> hiển thị lỗi
            $(this).siblings("p").remove();
            isErrorDisplay = true;
         }
      });

      if (vFullName.val() == "") {
         if (isErrorDisplay) {
            vFullName.closest(".form-group").append(`<p style="color:red; font-size: 0.8rem">Nhập Họ Tên</p>`);
            vFullName.focus();
            isErrorDisplay = false;
         }
         return false;
      }

      // Thêm sự kiện blur cho trường #inp-phoneNumber
      vPhoneNumber.on("blur", function () {
         if ($(this).val() != "" || !isNaN($(this).val())) {
            // Xóa thẻ <p> hiển thị lỗi
            $(this).siblings("p").remove();
            isErrorDisplay = true;
         }
      });

      if (vPhoneNumber.val() == "" || isNaN(vPhoneNumber.val())) {
         if (isErrorDisplay) {
            vPhoneNumber
               .closest(".form-group")
               .append(`<p style="color:red; font-size: 0.8rem">Nhập Số Điện Thoại và số điện thoại phải là sô</p>`);
            vPhoneNumber.focus();
            isErrorDisplay = false;
         }
         return false;
      }

      // Thêm sự kiện blur cho trường #inp-email
      vEmail.on("blur", function () {
         if ($(this).val() != "") {
            // Xóa thẻ <p> hiển thị lỗi
            $(this).siblings("p").remove();
            isErrorDisplay = true;
         }
      });

      if (vEmail.val() == "") {
         if (isErrorDisplay) {
            vEmail
               .closest(".form-group")
               .append(`<p style="color:red; font-size: 0.8rem">Nhập Email và đúng định dạng</p>`);
            vEmail.focus();
            isErrorDisplay = false;
         }
         return false;
      }

      // Thêm sự kiện blur cho trường #select-province
      vProvince.on("change", function () {
         if ($(this).val() != "") {
            // Xóa thẻ <p> hiển thị lỗi
            $(this).siblings("p").remove();
            isErrorDisplay = true;
         }
      });

      if (vProvince.val() == 0) {
         if (isErrorDisplay) {
            vProvince.closest(".form-group").append(`<p style="color:red; font-size: 0.8rem">Chọn Tỉnh, Thành Phố</p>`);
            vProvince.focus();
            isErrorDisplay = false;
         }
         return false;
      }

      // Thêm sự kiện blur cho trường #select-district
      vDistrict.on("change", function () {
         if ($(this).val() != "") {
            // Xóa thẻ <p> hiển thị lỗi
            $(this).siblings("p").remove();
            isErrorDisplay = true;
         }
      });

      if (vDistrict.val() == 0) {
         if (isErrorDisplay) {
            vDistrict.closest(".form-group").append(`<p style="color:red; font-size: 0.8rem">Chọn Quận, Huyện</p>`);
            vDistrict.focus();
            isErrorDisplay = false;
         }
         return false;
      }

      // Thêm sự kiện blur cho trường #select-ward
      vWard.on("change", function () {
         if ($(this).val() != "") {
            // Xóa thẻ <p> hiển thị lỗi
            $(this).siblings("p").remove();
            isErrorDisplay = true;
         }
      });

      if (vWard.val() == 0) {
         if (isErrorDisplay) {
            vWard.closest(".form-group").append(`<p style="color:red; font-size: 0.8rem">Chọn Phường Xã</p>`);
            vWard.focus();
            isErrorDisplay = false;
         }
         return false;
      }

      // Thêm sự kiện blur cho trường #select-province
      vAddress.on("blur", function () {
         if ($(this).val() != "") {
            // Xóa thẻ <p> hiển thị lỗi
            $(this).siblings("p").remove();
            isErrorDisplay = true;
         }
      });

      if (vAddress.val() == "") {
         if (isErrorDisplay) {
            vAddress.closest(".form-group").append(`<p style="color:red; font-size: 0.8rem">Nhập Địa Chỉ</p>`);
            vAddress.focus();
            isErrorDisplay = false;
         }
         return false;
      }

      return true;
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

   //Tạo Order cho Khách Hàng
   function createOrderOfCustomer(paramArrayInfo) {
      //Tạo customer
      $.ajax({
         type: "POST",
         url: `${gLocalhost}/customer`,
         contentType: "application/json",
         data: JSON.stringify(paramArrayInfo[0]),
         success: function (objCustomer) {
            // Tạo customer thành công thì tạo order
            $.ajax({
               type: "POST",
               url: `${gLocalhost}/order/customer/${objCustomer.id}/province/${paramArrayInfo[1].provinceId}/district/${paramArrayInfo[1].districtId}/ward/${paramArrayInfo[1].wardId}`,
               contentType: "application/json",
               data: JSON.stringify(paramArrayInfo[1]),
               success: function (objOrder) {
                  //Tạo order thành công thì tạo orderDetail
                  var vOrderInLocalStorage = JSON.parse(localStorage.getItem("bagProduct_HH") || "[]");
                  for (let orderDetail of vOrderInLocalStorage) {
                     var vOrderDetail = {
                        priceEach: orderDetail.gProduct.buyPrice,
                        quantityOrder: orderDetail.quantityItem,
                     };
                     $.ajax({
                        type: "POST",
                        url: `${gLocalhost}/orderDetail/product/${orderDetail.gProduct.id}/order/${objOrder.id}`,
                        contentType: "application/json",
                        data: JSON.stringify(vOrderDetail),
                        success: function (res) {
                           handleWhenOrderSuccess(res);
                        },
                     });
                  }
               },
               error: function (xhr) {
                  console.log(xhr);
               },
            });
         },
      });
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

   //Xử lý khi đặt đơn thành công
   function handleWhenOrderSuccess(paramNotice) {
      //Xóa LocalStorage giỏ Sản Phẩm
      localStorage.removeItem("bagProduct_HH");
      //Cập nhật lại số lượng hình ảnh trên giỏ hàng navbar
      getQuantityItemInBag();
      //Hiện Thông báo đã đặt hàng
      $("#notice-modal")
         .find("h6")
         .text("Cảm ơn bạn đã tin tưởng. Mã sản phẩm của bạn là " + paramNotice.orderCode)
         .show();

      //Cập nhật hiển thị giỏ hàng trống
      $("#notice-modal").on("hidden.bs.modal", function () {
         //Cập nhật hiển thị giỏ hàng trống
         $(".main-noItem").removeClass("d-none");
         $(".main-info").addClass("d-none");
         $(".main-item").addClass("d-none");
      });
      $("#notice-modal").modal("show");
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

      //Load Thông tin Khách hàng vào thông tin đặt hàng
      $("#inp-fullName").attr("readonly", true).val(paramData.fullNameCustomer);
      $("#inp-phoneNumber").attr("readonly", true).val(paramData.username);
      $("#inp-email").attr("readonly", true).val(paramData.email);
   }
});
