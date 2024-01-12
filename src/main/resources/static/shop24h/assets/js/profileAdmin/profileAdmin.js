const gLocalhost = "http://localhost:8080";

var vDetailUser;

//Kiểm tra user đã đăng nhập chưa
checkExistTokenUser();

//Kiểm tra user đăng nhập
function checkExistTokenUser() {
   var vLocalStorageUser = JSON.parse(localStorage.getItem("userSigninShop24h"));
   if (vLocalStorageUser == null) {
      window.location.href = "../../../error/error.html";
   } else {
      gHeader = {
         Authorization: "Bearer " + vLocalStorageUser.accessToken,
      };

      //Lấy Thông tin user từ mã token
      callApiDetailUser(gHeader);
   }
}

//Gọi API thông tin chi tiết User
function callApiDetailUser(paramHeader) {
   $.ajax({
      async: true,
      url: `${gLocalhost}/users/me`,
      type: "GET",
      headers: paramHeader,
      success: function (res) {
         vDetailUser = res;
         handleAfterLoginSuccess(res);
      },
      error: function (xhr) {
         window.location.href = "../../../error/error.html";
      },
   });
}

function handleAfterLoginSuccess(paramData) {
   var vAdminOrModerator = paramData.roles.some((item) => item.name == "ROLE_MODERATOR" || item.name == "ROLE_ADMIN");
   if (!vAdminOrModerator) {
      window.location.href = "../../../error/error.html";
   }
}

$(document).ready(function () {
   /*** REGION 1 - Global variables - Vùng khai báo biến, hằng số, tham số TOÀN CỤC */
   var isErrorChangePass = true;

   /*** REGION 2 - Vùng gán / thực thi sự kiện cho các elements */
   onPageLoading();

   //Sự kiện khi click Đăng xuất
   $("#btn-logout").on("click", function () {
      localStorage.removeItem("userSigninShop24h");
      window.location.href = "../../../home/home.html";
   });

   //Khi click vào thay đổi mật khẩu
   $("#change-password").on("click", function (event) {
      event.preventDefault();
      $("#inp-oldPass").val("");
      $("#inp-newPass").val("");
      $("#changePassword-modal").modal("show");
   });

   //Khi click vào xác nhận trong change Modal
   $("#btn-changePassword-modal").on("click", function () {
      if (validateChangePass()) {
         let vData = {
            oldPass: $("#inp-oldPass").val(),
            newPass: $("#inp-newPass").val(),
         };
         callApiChangePass(vData);
      }
   });

   /*** REGION 3 - Event handlers - Vùng khai báo các hàm xử lý sự kiện */
   function onPageLoading() {
      //Cập nhật avatar
      loadAvatar();

      //tải thông tin vào form hồ sơ
      loadDataToProfile();
   }
   /*** REGION 4 - Common funtions - Vùng khai báo hàm dùng chung trong toàn bộ chương trình*/
   //Gọi API change pass
   function callApiChangePass(paramData) {
      $.ajax({
         url: `${gLocalhost}/user/changePassword`,
         type: "PUT",
         contentType: "application/json",
         data: JSON.stringify(paramData),
         headers: gHeader,
         success: function (res) {
            $("#changePassword-modal").modal("hide");
            $("#notice-modal").find("h6").text("Cập Nhật Thành Công");
            $("#notice-modal").modal("show");
         },
         error: function (xhr) {
            console.log(xhr.responseText);
            if (isErrorChangePass) {
               $("#inp-oldPass").parent().append(`<p style="color:red">${xhr.responseText}</p>`);
               isErrorChangePass = false;
            }
         },
      });
   }

   //Kiểm tra thông tint trên modal thay đổi mật khẩu
   function validateChangePass() {
      var vOldPass = $("#inp-oldPass");
      var vNewPass = $("#inp-newPass");

      vOldPass.on("input", function () {
         if ($(this).val() !== "") {
            // Xóa thẻ <p> hiển thị lỗi
            $(this).siblings("p").remove();
            isErrorChangePass = true;
         }
      });

      if (vOldPass.val() == "") {
         if (isErrorChangePass) {
            vOldPass.parent().append(`<p style="color:red; font-size: 0.8rem">Nhập Mật Khẩu Cũ</p>`);
            vOldPass.focus();
            isErrorChangePass = false;
            isErrorChangePass = true;
         }
         return false;
      }

      vNewPass.on("input", function () {
         if ($(this).val() !== "") {
            // Xóa thẻ <p> hiển thị lỗi
            $(this).siblings("p").remove();
            isErrorChangePass = true;
         }
      });

      if (vNewPass.val() == "") {
         if (isErrorChangePass) {
            vNewPass.parent().append(`<p style="color:red; font-size: 0.8rem">Nhập Mật Khẩu Mới</p>`);
            vNewPass.focus();
            isErrorChangePass = false;
         }
         return false;
      }
      return true;
   }

   //cập nhật avatar
   function loadAvatar() {
      console.log(vDetailUser);
      // lấy họ tên khách hàng làm avartar
      let vStr = vDetailUser.fullNameCustomer.split(" ");
      let vLastElement = vStr[vStr.length - 1];
      let vFirstChar = vLastElement[0].toUpperCase();

      $(".navbar-avatar").html(
         `<span  style="font-size: 1.5rem; font-weight:bold ;color: red; background-color: #FFA88C; " class="rounded-circle px-2 d-sm-inline d-none">${vFirstChar}</span>`
      );
   }

   function loadDataToProfile() {
      //Load Thông tin Khách hàng vào thông tin đặt hàng
      $("#inp-fullName").val(vDetailUser.fullNameCustomer);
      $("#inp-phoneNumber").val(vDetailUser.username);
      $("#inp-email").val(vDetailUser.email);
   }
});
