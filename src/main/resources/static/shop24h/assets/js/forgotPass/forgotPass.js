$(document).ready(function () {
   /*** REGION 1 - Global variables - Vùng khai báo biến, hằng số, tham số TOÀN CỤC */
   const gLocalhost = "https://shop24hv2-production.up.railway.app";

   var gHeader;
   var isErrorDisplay = true;
   var isErrorDisplaySignin = true;
   var isErrorSignUp = true;
   var isErrorSignIn = true;
   var isErrorForgot = true;
   var isErrorApiForgotFalse = true;

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

   //Khi click vào nút xác nhận quên mật khẩu
   $("#btn-confirm").on("click", function () {
      let vData = getDataFormForgot();
      if (validateForgot()) {
         callApiResetPass(vData);
      }
   });

   /*** REGION 3 - Event handlers - Vùng khai báo các hàm xử lý sự kiện */
   //Khi load trang thành công
   function onPageLoading() {
      //Lấy Số Lượng Sản phẩm Giỏ hàng trong localStorage hiển thị số lượng lên giỏ hàng navbar
      getQuantityItemInBag();
   }

   /*** REGION 4 - Common funtions - Vùng khai báo hàm dùng chung trong toàn bộ chương trình*/

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
            setLocalStorageUser(res);
         },
         error: function (xhr) {
            if (isErrorSignIn) {
               $("#inp-oldPass").parent().append(`<p style="color:red">${xhr.responseText}</p>`);
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

   //Gọi Api Reset Mật Khẩu
   function callApiResetPass(paramData) {
      $.ajax({
         type: "POST",
         url: `${gLocalhost}/user/forgotPass`,
         contentType: "application/json",
         data: JSON.stringify(paramData),
         beforeSend: function () {
            // Trước khi gửi Ajax, hiển thị div loading
            $("#loading").css("visibility", "visible");
         },
         success: function (res) {
            $("#loading").css("visibility", "hidden");

            showNotice(res);
         },
         error: function (xhr) {
            $("#loading").css("visibility", "hidden");

            handleForgotFalse(xhr);
         },
      });
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
      vInfo.fullName = $("#inp-signUp-fullName").val();
      vInfo.phoneNumber = $("#inp-signUp-phoneNumber").val();
      vInfo.email = $("#inp-signUp-email").val();
      vInfo.username = $("#inp-signUp-phoneNumber").val();
      vInfo.password = $("#inp-signUp-password").val();
      vInfo.confirmPassword = $("#inp-signUp-confirm-password").val();
      return vInfo;
   }

   //Lấy Thông tin từ modal Đăng Nhập
   function getInfoInSignInModal() {
      vInfo = {};
      vInfo.username = $("#inp-signIn-phoneNumber").val();
      vInfo.password = $("#inp-signIn-password").val();
      return vInfo;
   }

   //Lấy thông tin trên form forgot
   function getDataFormForgot() {
      let vData = {};
      vData.username = $("#inp-forgot-username").val().trim();
      vData.secretQuestion = $("#select-forgot-question :selected").text();
      vData.secretAnswer = $("#inp-forgot-answer").val().trim();
      return vData;
   }

   //Kiểm tra thông tin modal Đăng ký
   function validateInfo(paramInfo) {
      var vFullName = $("#inp-signUp-fullName");
      var vPhoneNumber = $("#inp-signUp-phoneNumber");
      var vEmail = $("#inp-signUp-email");
      var vPassword = $("#inp-signUp-password");
      var vConfirmPassword = $("#inp-signUp-confirm-password");

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

   //Kiểm tra thông tint trên form quên mật khẩu
   function validateForgot() {
      var vUsername = $("#inp-forgot-username");
      var vAnswer = $("#inp-forgot-answer");

      vUsername.on("input", function () {
         if ($(this).val() !== "") {
            // Xóa thẻ <p> hiển thị lỗi
            $(this).siblings("p").remove();
            isErrorForgot = true;
            isErrorApiForgotFalse = true;
         }
      });

      if (vUsername.val() == "" || isNaN(vUsername.val())) {
         if (isErrorForgot) {
            vUsername.parent().append(`<p style="color:red; font-size: 0.8rem">Số điện thoại phải là số </p>`);
            vUsername.focus();
            isErrorForgot = false;
         }
         return false;
      }

      vAnswer.on("input", function () {
         if ($(this).val() !== "") {
            // Xóa thẻ <p> hiển thị lỗi
            $(this).siblings("p").remove();
            isErrorForgot = true;
            isErrorApiForgotFalse = true;
         }
      });

      if (vAnswer.val() == "") {
         if (isErrorForgot) {
            vAnswer.parent().append(`<p style="color:red; font-size: 0.8rem">Nhập câu trả lời</p>`);
            vAnswer.focus();
            isErrorForgot = false;
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

      //Load Thông tin Khách hàng vào thông tin đặt hàng
      $("#inp-fullName").val(paramData.fullNameCustomer);
      $("#inp-phoneNumber").val(paramData.username);
      $("#inp-email").val(paramData.email);
   }

   //Xử lý khi xác nhận quên mật khẩu thất bại
   function handleForgotFalse(paramXhr) {
      if (paramXhr.status == 404) {
         if (isErrorApiForgotFalse) {
            $("#inp-forgot-username")
               .parent()
               .append(`<p style="color: red; font-size: 0.8rem">${paramXhr.responseText}</p>`);
            isErrorApiForgotFalse = false;
         }
      }

      if (paramXhr.status == 400) {
         if (isErrorApiForgotFalse) {
            $("#inp-forgot-answer")
               .parent()
               .append(`<p style="color: red; font-size: 0.8rem">${paramXhr.responseText}</p>`);
            isErrorApiForgotFalse = false;
         }
      }
   }

   function showNotice(paramText) {
      $("#notice-modal").find("h6").text(paramText);
      $("#notice-modal").modal("show");
   }
});
