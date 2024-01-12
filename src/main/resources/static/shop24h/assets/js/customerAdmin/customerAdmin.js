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
      url: `${gLocalhost}/users/me`,
      type: "GET",
      async: true,
      headers: paramHeader,
      success: function (res) {
         vDetailUser = res;
         handleAfterLoginSuccess(res);
      },
      error: function (xhr) {
         console.log(xhr);
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

//---------------------- INPUT NUMBER --------------------------
function formatNumber(input) {
   var num = input.value.replace(/\D/g, "");
   var formattedNum = Number(num).toLocaleString("en");
   input.value = formattedNum;
}

$(document).ready(function () {
   var vTable = $("#customer-table").DataTable({});

   /*** REGION 1 - Global variables - Vùng khai báo biến, hằng số, tham số TOÀN CỤC */
   var gCustomerIdClick;

   /*** REGION 2 - Vùng gán / thực thi sự kiện cho các elements */
   onPageLoading();

   //Sự kiện khi click Đăng xuất
   $("#btn-logout").on("click", function () {
      localStorage.removeItem("userSigninShop24h");
      window.location.href = "../../../home/home.html";
   });

   // --------------------- TÌM KIẾM ------------------------------------
   $("#select-sort").on("change", function () {
      vTable = loadTable(getDataFindToUrl());
   });

   $("#inp-phoneNumber").on("keyup", function () {
      vTable = loadTable(getDataFindToUrl());
   });

   // --------------------- UPDATE --------------------------------
   //Sự kiện khi click vào nút cập nhật trên table
   $("#customer-table").on("click", ".update-fa", function () {
      $(".notice-warning").remove();

      vIsDisplay = true;

      $("#updateCustomer-modal").modal("show");
      var vDataRow = getDataRow(this);
      loadDataToModalUpdate(vDataRow);
   });

   //Sự kiện khi click nút update trên modal update
   $("#btn-update-modal").on("click", function () {
      let vData = getDataInUpdateModal();
      let vValidate = valvValidateData(vData);
      if (vValidate) {
         callApiUpdateCustomer(vData);
      }
   });

   // // --------------------- DELETE --------------------------------
   //Sử kiện khi click vào nút xóa trên table
   $("#customer-table").on("click", ".delete-fa", function () {
      $("#deleteCustomer-modal").modal("show");
      getDataRow(this);
   });

   //Sự kiện khi nút button Xóa trong modal delete
   $("#btn-delete-modal").on("click", function () {
      callApiDeleteCustomer();
   });

   /*** REGION 3 - Event handlers - Vùng khai báo các hàm xử lý sự kiện */
   function onPageLoading() {
      vTable = loadTable(getDataFindToUrl());
      //Cập nhật avatar
      loadAvatar();
   }

   /*** REGION 4 - Common funtions - Vùng khai báo hàm dùng chung trong toàn bộ chương trình*/
   // ------------------------------ CALL API ----------------------------------------------

   function callApiDeleteCustomer() {
      $.ajax({
         headers: gHeader,
         url: `${gLocalhost}/customer/deleteCustomer/${gCustomerIdClick}`,
         type: "DELETE",
         success: function (res) {
            $("#deleteCustomer-modal").modal("hide");
            showNotice("Đã Xóa Khách Hàng");
            vTable.ajax.reload(null, false); // Cập nhật lại bảng mà không làm mất trang hiện tại
         },
         error: function (xhr) {
            console.log(xhr.re);
         },
      });
   }

   function callApiUpdateCustomer(paramCustomer) {
      $.ajax({
         url: `${gLocalhost}/customer/updateCustomer/${gCustomerIdClick}`,
         type: "PUT",
         headers: gHeader,
         contentType: "application/json",
         data: JSON.stringify(paramCustomer),
         success: function (res) {
            $("#updateCustomer-modal").modal("hide");
            showNotice("Cập Nhật Thành Công");
            vTable.ajax.reload(null, false); // Cập nhật lại bảng mà không làm mất trang hiện tại
         },
         error: function (xhr) {
            handleFailUpdateCustomer(xhr);
         },
      });
   }

   // ----------------------------------------------------------------------------------------

   function loadTable(url) {
      var currentPageStartIndex = 0;

      vTable.destroy();
      return $("#customer-table").DataTable({
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
            beforeSend: function (xhr) {
               for (key in gHeader) {
                  xhr.setRequestHeader(key, gHeader[key]);
               }
            },

            dataType: "json",
            dataSrc: function (json) {
               json.recordsFiltered = json.totalElements;
               json.recordsTotal = json.totalElements;
               json.start = currentPageStartIndex;

               return json.content;
            },
         },

         columns: [
            { data: "id" },
            { data: "fullName" },
            { data: "phoneNumber" },
            { data: "email" },
            { data: "totalOrder" },
            { data: "totalPriceCustomer" },
            // { data: "role[0].name" },
            { data: "Cập Nhật" },
         ],
         columnDefs: [
            { targets: [0, 1, 2, 3, 4, 5, 6], class: "text-center" },
            {
               targets: 0,
               render: function (data, type, row, meta) {
                  // Sử dụng meta.row để lấy chỉ số của hàng
                  return currentPageStartIndex + meta.row + 1;
               },
            },

            {
               targets: 5,
               render: function (data) {
                  return data.toLocaleString() + " đ";
               },
            },

            // {
            //    targets: 6,
            //    render: function (data) {
            //       if (data == "ROLE_USER") {
            //          return "User";
            //       }

            //       if (data == "ROLE_MODERATOR") {
            //          return "Mod";
            //       }

            //       if (data == "ROLE_ADMIN") {
            //          return "Admin";
            //       } else {
            //          return "Chưa Đăng Ký";
            //       }
            //    },
            // },

            {
               targets: 6,
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
      $("#inp-update-email").val(paramData.email);
      $("#inp-update-name").val(paramData.fullName);
   }

   //Lấy id của Row trên table
   function getDataRow(paramBtn) {
      let vTrClick = $(paramBtn).closest("tr");
      let vDataRow = vTable.row(vTrClick).data();
      gCustomerIdClick = vDataRow.id;
      console.log(vDataRow);
      return vDataRow;
   }

   //Lấy thông tin tìm kiếm
   function getDataFindToUrl() {
      let vPhone = $("#inp-phoneNumber").val();
      let vSort = $("#select-sort").val();
      let vUrl = `${gLocalhost}/customer/customerByPhoneNumber/${vSort}?keyPhoneNumber=${vPhone}`;
      return vUrl;
   }

   //Lấy thông tin trong modalUpdate
   function getDataInUpdateModal() {
      let vData = {};
      vData.fullName = $("#inp-update-name").val().trim();
      vData.email = $("#inp-update-email").val().trim();
      return vData;
   }

   var vIsDisplay = true;
   //Kiểm tra thông tin ở Inser Modal
   function valvValidateData() {
      var vEmail = $("#inp-update-email");
      var vName = $("#inp-update-name");

      // Thêm sự kiện input cho trường tên
      vName.on("input", function () {
         // Xóa thẻ <span> hiển thị lỗi
         $(this).siblings("span").remove();
         vIsDisplay = true;
      });

      if (vName.val() == "") {
         if (vIsDisplay) {
            vName.parent().append(`<span class="notice-warning">Nhập tên khách hàng</span>`);
            vName.focus();
            vIsDisplay = false;
         }
         return false;
      }

      // Thêm sự kiện input cho email
      vEmail.on("input", function () {
         // Xóa thẻ <span> hiển thị lỗi
         $(this).siblings("span").remove();
         vIsDisplay = true;
      });

      if (vEmail.val() == "") {
         if (vIsDisplay) {
            vEmail.parent().append(`<span class="notice-warning">Nhập mã khách hàng</span>`);
            vEmail.focus();
            vIsDisplay = false;
         }
         return false;
      }

      return true;
   }

   function handleFailUpdateCustomer(paramXhr) {
      if (paramXhr.status == 400) {
         var responseText = paramXhr.responseText;
         let vEmail = $("#inp-update-email");

         if (responseText == "Email đã tồn tại") {
            if (vIsDisplay == true) {
               vEmail.parent().append(`<span style="color:red" class="notice-warning">${responseText}</span>`);
               vIsDisplay = false;
            }
         }
      }
   }

   function showNotice(paramText) {
      $("#notice-modal").find("h6").text(paramText);
      $("#notice-modal").modal("show");
   }
});
