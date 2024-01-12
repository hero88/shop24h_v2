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
      async: false,
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

$(document).ready(function () {
   var vTable = $("#order-table").DataTable({});

   /*** REGION 1 - Global variables - Vùng khai báo biến, hằng số, tham số TOÀN CỤC */
   var gOrderIdClick;
   /*** REGION 2 - Vùng gán / thực thi sự kiện cho các elements */
   //Sự kiện trong thẻ input daterangepicker
   $("#reservation").daterangepicker(
      {
         locale: {
            format: "DD/MM/YYYY",
            cancelLabel: "Hủy",
            applyLabel: "Áp dụng",
            daysOfWeek: ["CN", "T2", "T3", "T4", "T5", "T6", "T7"],
            monthNames: [
               "Tháng 1",
               "Tháng 2",
               "Tháng 3",
               "Tháng 4",
               "Tháng 5",
               "Tháng 6",
               "Tháng 7",
               "Tháng 8",
               "Tháng 9",
               "Tháng 10",
               "Tháng 11",
               "Tháng 12",
            ],
         },
      },
      function (start, end, label) {
         // Sử dụng start và end để cập nhật giá trị input
         var startDate = start.format("DD/MM/YYYY");
         var endDate = end.format("DD/MM/YYYY");
         $("#reservation").val(startDate + " - " + endDate);
      }
   );

   onPageLoading();

   $("#order-table").on("change", ".select-status", function () {
      // Lấy giá trị của option được chọn
      var selectedOption = $(this).find("option:selected");
      var selectedColorClass = selectedOption.attr("class");

      // Xóa tất cả các class màu cũ trên select box
      $(this).removeClass("text-danger text-primary text-success");

      // Thêm class màu tương ứng với option được chọn vào select box
      $(this).addClass(selectedColorClass);
      let vStatus = selectedOption.val();
      let vOrderId = getDataRow(this).id;
      callApiUpdateStatusOrder(vStatus, vOrderId);
   });

   //Sự kiện khi click Đăng xuất
   $("#btn-logout").on("click", function () {
      localStorage.removeItem("userSigninShop24h");
      window.location.href = "../../../home/home.html";
   });

   //Sự kiện khi thay đổi select-status
   $("#select-status-find").on("change", function () {
      vTable = loadTable(getDataFind());
   });

   //Sự kiện khi thay đổi date-picker
   $("#reservation").on("apply.daterangepicker", function () {
      vTable = loadTable(getDataFind());
   });

   //Sự kiện khi thay đổi select-customer
   $("#select-customer").on("change", function () {
      vTable = loadTable(getDataFind());
   });

   // --------------------- UPDATE --------------------------------
   //Sự kiện khi click vào nút cập nhật trên table
   $("#order-table").on("click", ".update-fa", function () {
      $("#updateProduct-modal").modal("show");
      var vDataRow = getDataRow(this);
      loadDataToModalUpdate(vDataRow);
   });

   //Sự kiện khi click nút update trên modal update
   $("#btn-update-modal").on("click", function () {
      let vData = getDataInUpdateModal();
      callApiUpdateProduct(vData);
   });

   //Sự kiện khi click button cập nhật file trong modal update
   $("#inp-update-file").on("change", function () {
      var vFile = $(this)[0].files;
      if (vFile.length > 0) {
         $(".img-update-modal").empty();
         for (let bI = 0; bI < vFile.length; bI++) {
            $(".img-update-modal").append(`
            <div class="col-4 pt-2">
            <img
               src="${gLocalhost}/product-photos/${vFile[bI].name}"
               alt=""
               class="img-fluid"
            />
         </div> `);
         }
      }
   });

   // --------------------- DELETE --------------------------------
   //Sử kiện khi click vào nút xóa trên table
   $("#order-table").on("click", ".delete-fa", function () {
      $("#deleteOrder-modal").modal("show");
      getDataRow(this);
   });

   //Sự kiện khi nút button Xóa trong modal delete
   $("#btn-delete-modal").on("click", function () {
      callApiDeleteOrder();
   });

   // --------------------- INSERT --------------------------------
   //Sự kiện khi click nút Thêm
   $("#btn-insert").on("click", function () {
      $("#insertProduct-modal").modal("show");
      $("#select-insert-productLine").val(1);
      $("#inp-insert-code").val("");
      $("#inp-insert-name").val("");
      $("#text-insert-description").val("");
      $("#select-insert-vendor").val(0);
      $("#inp-insert-quantityInStock").val("");
      $("#inp-insert-buyPrice").val("");
      $("#inp-insert-file").val("");

      $(".img-insert-modal").empty();
   });

   //Sự kiện khi click button cập nhật file trong modal update
   $("#inp-insert-file").on("change", function () {
      var vFile = $(this)[0].files;
      if (vFile.length > 0) {
         $(".img-insert-modal").empty();
         for (let bI = 0; bI < vFile.length; bI++) {
            $(".img-insert-modal").append(`
               <div class="col-4 pt-2">
               <img
                  src="${gLocalhost}/product-photos/${vFile[bI].name}"
                  alt=""
                  class="img-fluid"
               />
            </div> `);
         }
      }
   });

   // --------------------- DETAIL --------------------------------
   //Sử kiện khi click vào nút xóa trên table
   $("#order-table").on("click", ".fa-detail", function () {
      let vData = getDataRow(this);
      window.open("../dashboard/orderDetailAdmin.html?orderId=" + vData.id, "_blank");
   });

   /*** REGION 3 - Event handlers - Vùng khai báo các hàm xử lý sự kiện */
   function onPageLoading() {
      //Gọi API select customer
      callApiAllCustomer();

      //Cập nhật avatar
      loadAvatar();
   }

   /*** REGION 4 - Common funtions - Vùng khai báo hàm dùng chung trong toàn bộ chương trình*/
   // ------------------------------ CALL API ----------------------------------------------

   //Gọi API all Customer
   function callApiAllCustomer() {
      $.ajax({
         url: `${gLocalhost}/customer/allCustomer`,
         headers: gHeader,
         type: "GET",
         success: function (res) {
            loadCustomerToSelect(res);
         },
      });
   }

   //Gọi API xóa Order
   function callApiDeleteOrder() {
      $.ajax({
         url: `${gLocalhost}/deleteOrder/${gOrderIdClick}`,
         headers: gHeader,
         type: "DELETE",
         success: function (res) {
            $("#deleteOrder-modal").modal("hide");
            showNotice("XóaThành Công");
            vTable.ajax.reload(null, false); // Cập nhật lại bảng mà không làm mất trang hiện tại
         },
      });
   }

   //Gọi API Update Status Order
   function callApiUpdateStatusOrder(paramStatus, paramId) {
      $.ajax({
         url: `${gLocalhost}/updateStatusOrder/${paramId}/${paramStatus}`,
         type: "PUT",
         headers: gHeader,
         contentType: "application/json",
         success: function (res) {
            showNotice("Cập Nhật Thành Công");
            vTable.ajax.reload(null, false); // Cập nhật lại bảng mà không làm mất trang hiện tại
         },
         error: function (xhr) {
            alert(xhr);
         },
      });
   }

   // ----------------------------------------------------------------------------------------

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

   function loadTable(parramUrl) {
      var currentPageStartIndex = 0;

      vTable.destroy();
      return $("#order-table").DataTable({
         processing: false,
         serverSide: true,
         autoWidth: false,
         searching: false,
         ajax: {
            url: parramUrl,
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
               loadOveral(json.hashMapField);

               return json.content;
            },
         },

         columns: [
            { data: "id" },
            { data: "orderCode" },
            { data: "customerName" },
            { data: "address" },
            { data: "provinceName" },
            { data: "districtName" },
            { data: "orderDate" },
            { data: "status" },
            { data: "totalPriceOrder" },
            { data: "Cập Nhật" },
            { data: "Chi tiết" },
         ],
         columnDefs: [
            { targets: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], class: "text-center" },
            {
               targets: 0,
               render: function (data, type, row, meta) {
                  // Sử dụng meta.row để lấy chỉ số của hàng
                  return currentPageStartIndex + meta.row + 1;
               },
            },

            {
               targets: 7,
               render: function (data) {
                  var statuses = {
                     "Chờ Xác Nhận": "text-danger",
                     "Đang Giao": "text-primary",
                     "Đã Giao": "text-success",
                  };

                  var html = `<select class="select-status ${statuses[data]}" style="font-weight: bold;">`;
                  for (var status in statuses) {
                     var selected = data == status ? "selected" : "";
                     html += `<option class=" ${statuses[status]} value="${status}"   ${selected}>${status}</option>`;
                  }
                  html += "</select>";
                  return html;
               },
            },

            {
               targets: 8,
               render: function (data) {
                  return data.toLocaleString() + " đ";
               },
            },

            {
               // <i class=" fa-sharp fa-solid fa-pen-to-square update-fa text-info" title="Sửa" style="cursor: pointer"></i>&nbsp;&nbsp;&nbsp;
               targets: 9,
               defaultContent: `<i class=" fa-solid fa-trash delete-fa text-danger" title="Xóa" style="cursor: pointer"></i>`,
            },
            {
               targets: 10,
               defaultContent: `<i class="fa-solid fa-circle-info fa-detail" title="Show/Hide Detail" style="cursor: pointer"></i>`,
            },
         ],

         preDrawCallback: function (settings) {
            var api = new $.fn.dataTable.Api(settings);
            currentPageStartIndex = api.page.info().start;
         },
      });
   }

   //Tải danh sách customer vào select Customer
   function loadCustomerToSelect(paramCustomer) {
      for (let bI = 0; bI < paramCustomer.length; bI++) {
         $("#select-customer").append(
            `<option value="${paramCustomer[bI].id}">${paramCustomer[bI].fullName} - ${paramCustomer[bI].phoneNumber}</option>`
         );
      }

      vTable = loadTable(getDataFind());
   }

   function loadDataToModalUpdate(paramData) {
      $("#inp-update-code").val(paramData.productCode);
      $("#inp-update-name").val(paramData.productName);
      $("#inp-update-buyPrice").val(paramData.buyPrice.toLocaleString());
      $("#inp-update-quantityInStock").val(paramData.quantityInStock);
      $("#text-update-description").val(paramData.productDescripttion);
      $("#select-update-vendor option").removeAttr("selected");
      $("#select-update-vendor option:contains('" + paramData.productVendor + "')").attr("selected", true);
      $(".img-update-modal").empty();
      for (let bI = 0; bI < paramData.productImg.length; bI++) {
         $(".img-update-modal").append(`
         <div class="col-4 pt-2">
         <img
            src="${gLocalhost}/product-photos/${paramData.productImg[bI]}"
            alt=""
            class="img-fluid"
         />
      </div> `);
      }
      $("#inp-update-file").val("");
   }

   function loadOveral(paramData) {
      var vSucess = paramData.success !== undefined ? paramData.success : 0;
      var vDelivery = paramData.delivery !== undefined ? paramData.delivery : 0;
      var vWaitConfirm = paramData.waitConfirm !== undefined ? paramData.waitConfirm : 0;
      $("#value-totalPrice").text(paramData.totalPrice.toLocaleString() + " đ");
      $("#value-success").text(vSucess);
      $("#value-delivery").text(vDelivery);
      $("#value-waitConfirm").text(vWaitConfirm);
   }

   //lấy thông tin từ tìm kiếm trả vè Url để gọi APi
   function getDataFind() {
      let picker = $("#reservation").data("daterangepicker");
      let startDateAPI = picker.startDate.format("DD-MM-YYYY");
      let endDateAPI = picker.endDate.format("DD-MM-YYYY");
      let vStatus = $("#select-status-find").val();
      let vCusomerId = $("#select-customer").val();

      let vUrl = `${gLocalhost}/orders/searchDateAndStatusAndCustomer/${startDateAPI}/${endDateAPI}/${vStatus}/${vCusomerId}`;
      return vUrl;
   }

   function getDataRow(paramBtn) {
      let vTrClick = $(paramBtn).closest("tr");
      let vDataRow = vTable.row(vTrClick).data();
      gOrderIdClick = vDataRow.id;
      return vDataRow;
   }

   function getDataInUpdateModal() {
      let vData = {};
      vData.productCode = $("#inp-update-code").val().trim();
      vData.productName = $("#inp-update-name").val().trim();
      vData.productDescripttion = $("#text-update-description").val().trim();
      vData.productVendor = $("#select-update-vendor option:selected").text();
      vData.quantityInStock = $("#inp-update-quantityInStock").val();
      vData.buyPrice = $("#inp-update-buyPrice").val();
      vData.productImg = [];

      $(".img-update-modal img").each(function () {
         var src = $(this).attr("src");
         vData.productImg.push(src.split("/").pop());
      });
      return vData;
   }

   function showNotice(paramText) {
      $("#notice-modal").find("h6").text(paramText);
      $("#notice-modal").modal("show");
   }
});
