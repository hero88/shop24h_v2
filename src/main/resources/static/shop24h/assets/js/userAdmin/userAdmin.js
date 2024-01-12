var vDetailUser;
const gLocalhost = "http://localhost:8080";

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
      url: `http://localhost:8080/users/me`,
      type: "GET",
      async: true,
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

//Xử lý nếu đăng nhập thành Công
function handleAfterLoginSuccess(paramData) {
   var vAdminOrModerator = paramData.roles.some((item) => item.name == "ROLE_MODERATOR" || item.name == "ROLE_ADMIN");
   if (!vAdminOrModerator) {
      window.location.href = "../../../error/error.html";
   }
}

$(document).ready(function () {
   var vTable = $("#user-table").DataTable({});

   /*** REGION 1 - Global variables - Vùng khai báo biến, hằng số, tham số TOÀN CỤC */
   var gIdUserClick;
   var isErrorDisplay = true;

   /*** REGION 2 - Vùng gán / thực thi sự kiện cho các elements */
   onPageLoading();

   //Sự kiện khi click Đăng xuất
   $("#btn-logout").on("click", function () {
      localStorage.removeItem("userSigninShop24h");
      window.location.href = "../../../home/home.html";
   });

   // --------------------- SỰ KIỆN TÌM KIẾM --------------------------------

   //Sự kiện khi tìm kiêm
   $("#inp-username").on("keyup", function () {
      vTable = loadTable(getDataFindToUrl());
   });

   // --------------------- UPDATE --------------------------------
   //Sự kiện khi click vào nút cập nhật trên table
   $("#user-table").on("click", ".update-fa", function () {
      $("#updateUser-modal").modal("show");
      var vDataRow = getDataRow(this);
      loadDataToModalUpdate(vDataRow);
   });

   //Sự kiện khi click nút update trên modal update
   $("#btn-update-modal").on("click", function () {
      let vRole = $("#select-role").val();
      callApiUpdateUser(vRole);
   });

   // // --------------------- DELETE --------------------------------
   //Sử kiện khi click vào nút xóa trên table
   $("#user-table").on("click", ".delete-fa", function () {
      $("#deleteUser-modal").modal("show");
      getDataRow(this);
   });

   //Sự kiện khi nút button Xóa trong modal delete
   $("#btn-delete-modal").on("click", function () {
      callApiDeleteUser();
   });

   // // --------------------- INSERT --------------------------------
   // //Sự kiện khi click nút Thêm
   $("#btn-insert").on("click", function () {
      $("#insertUser-modal").modal("show");
      $("#inp-signUp-fullName").val("");
      $("#inp-signUp-phoneNumber").val("");
      $("#inp-signUp-email").val("");
      $("#inp-signUp-phoneNumber").val("");
      $("#inp-signUp-password").val("");
      $("#inp-signUp-confirm-password").val("");
      $("#inp-signUp-answer").val("");
   });

   // //Sự kiện khi click nút thêm trong modal
   //Khi click vào nút đăng ký trong modal
   $("#btn-insert-modal").on("click", function () {
      var vInfo = getInfoInSignUpModal();
      var vValidate = validateInfo(vInfo);
      if (vValidate) {
         callApiCreateUser(vInfo);
      }
   });

   /*** REGION 3 - Event handlers - Vùng khai báo các hàm xử lý sự kiện */
   function onPageLoading() {
      vTable = loadTable(getDataFindToUrl());
      //Cập nhật avatar
      loadAvatar();
   }

   /*** REGION 4 - Common funtions - Vùng khai báo hàm dùng chung trong toàn bộ chương trình*/
   // ------------------------------ CALL API ----------------------------------------------

   //Gọi API tạo user với customer theo user
   function callApiCreateUser(paramInfo) {
      $.ajax({
         type: "POST",
         url: `${gLocalhost}/signupCilent`,
         contentType: "application/json",
         data: JSON.stringify(paramInfo),
         success: function (res) {
            $("#insertUser-modal").modal("hide");
            showNotice("Đã Thêm Tài Khoản");
            vTable.ajax.reload(null, false); // Cập nhật lại bảng mà không làm mất trang hiện tại
         },
         error: function (xhr) {
            if (isErrorSignUp) {
               $("#inp-signUp-phoneNumber").parent().append(`<p style="color:red">${xhr.responseJSON.message}</p>`);
               isErrorSignUp = false;
            }
         },
      });
   }

   function callApiDeleteUser() {
      $.ajax({
         headers: gHeader,
         url: `${gLocalhost}/user/deleteUser/${gIdUserClick}`,
         type: "DELETE",
         success: function (res) {
            $("#deleteUser-modal").modal("hide");
            showNotice("Đã Xóa User");
            vTable.ajax.reload(null, false); // Cập nhật lại bảng mà không làm mất trang hiện tại
         },
      });
   }

   function callApiUpdateUser(paramRole) {
      $.ajax({
         url: `${gLocalhost}/user/updateUser/${gIdUserClick}/${paramRole}`,
         type: "PUT",
         headers: gHeader,
         contentType: "application/json",
         success: function (res) {
            $("#updateUser-modal").modal("hide");
            showNotice("Cập Nhật Thành Công");

            vTable.ajax.reload(null, false); // Cập nhật lại bảng mà không làm mất trang hiện tại
         },
         error: function (xhr) {
            alert(xhr);
         },
      });
   }

   // ----------------------------------------------------------------------------------------

   function loadTable(url) {
      var currentPageStartIndex = 0;

      vTable.destroy();
      return $("#user-table").DataTable({
         processing: false,
         serverSide: true,
         autoWidth: false,
         searching: false,
         ajax: {
            url: url,
            data: function (d) {
               d.size = d.length;
               d.page = Math.floor(d.start / d.length);
               return d;
            },
            dataType: "json",
            beforeSend: function (xhr) {
               for (key in gHeader) {
                  xhr.setRequestHeader(key, gHeader[key]);
               }
            },

            dataSrc: function (json) {
               json.recordsFiltered = json.totalElements;
               json.recordsTotal = json.totalElements;
               json.start = currentPageStartIndex;

               return json.content;
            },
         },

         columns: [
            { data: "id" },
            { data: "username" },
            { data: "fullNameCustomer" },
            { data: "roles[0].name" },
            { data: "Cập Nhật" },
         ],
         columnDefs: [
            { targets: [0, 1, 2, 3, 4], class: "text-center" },
            {
               targets: 0,
               render: function (data, type, row, meta) {
                  // Sử dụng meta.row để lấy chỉ số của hàng
                  return currentPageStartIndex + meta.row + 1;
               },
            },

            {
               targets: 3,
               render: function (data) {
                  if (data == "ROLE_USER") {
                     return "User";
                  }

                  if (data == "ROLE_MODERATOR") {
                     return "Mod";
                  }

                  if (data == "ROLE_ADMIN") {
                     return "Admin";
                  } else {
                     return "Chưa Đăng Ký";
                  }
               },
            },

            {
               targets: 4,
               defaultContent: `<i class=" fa-sharp fa-solid fa-pen-to-square update-fa text-info" title="Sửa" style="cursor: pointer"></i>&nbsp;&nbsp;&nbsp;
              <i class=" fa-solid fa-trash delete-fa text-danger" title="Xóa" style="cursor: pointer"></i>`,
            },
         ],

         preDrawCallback: function (settings) {
            var api = new $.fn.dataTable.Api(settings);
            currentPageStartIndex = api.page.info().start;
         },
      });
   }
   // -----------------------------------------------------------------
   //cập nhật avatar
   function loadAvatar() {
      // lấy họ tên khách hàng làm avartar
      let vStr = vDetailUser.fullNameCustomer.split(" ");
      let vLastElement = vStr[vStr.length - 1];
      let vFirstChar = vLastElement[0].toUpperCase();

      $(".navbar-avatar").html(
         `<span  style="font-size: 1.5rem; font-weight:bold ;color: red; background-color: #FFA88C; " class="rounded-circle px-2 d-sm-inline d-none">${vFirstChar}</span>`
      );
   }

   function loadDataToModalUpdate(paramData) {
      $("#select-role").val(paramData.roles[0].name);
   }

   //Lấy id của Row trên table
   function getDataRow(paramBtn) {
      let vTrClick = $(paramBtn).closest("tr");
      let vDataRow = vTable.row(vTrClick).data();
      gIdUserClick = vDataRow.id;
      return vDataRow;
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

   //Lấy thông tin tìm kiếm chuyển tới url table
   function getDataFindToUrl() {
      let vUsernameFind = $("#inp-username").val();
      let vUrl = `${gLocalhost}/user/username?keyUsername=${vUsernameFind}`;
      return vUrl;
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

   function showNotice(paramText) {
      $("#notice-modal").find("h6").text(paramText);
      $("#notice-modal").modal("show");
   }
});
