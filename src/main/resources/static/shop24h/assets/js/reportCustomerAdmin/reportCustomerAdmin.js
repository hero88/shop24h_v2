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
      async: false,
      url: `http://localhost:8080/users/me`,
      type: "GET",
      headers: paramHeader,
      success: function (res) {
         vDetailUser = res;
         handleAfterLoginSuccess(res);
      },
      error: function (xhr) {
         console.log(xhr);
         window.location.href = `../../../error/error.html`;
      },
   });
}

function handleAfterLoginSuccess(paramData) {
   var vAdminOrModerator = paramData.roles.some((item) => item.name == "ROLE_ADMIN");
   if (!vAdminOrModerator) {
      window.location.href = `../../../error/error.html`;
   }
}

$(document).ready(function () {
   /*** REGION 1 - Global variables - Vùng khai báo biến, hằng số, tham số TOÀN CỤC */
   var gCustomerByPrice;

   /*** REGION 2 - Vùng gán / thực thi sự kiện cho các elements */
   onPageLoading();

   //Sự kiện khi click nút thu nhỏ report
   $(".btnToggle").click(function () {
      $(this).closest(".my-card").find(".my-card-body").fadeToggle();
   });

   //Sự kiện khi tải excel theo giá
   $("#btn-exportCustomerByPrice").click(function () {
      var worksheet = XLSX.utils.json_to_sheet(gCustomerByPrice);
      var workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "CustomerByPrice");
      var filename = "CustomerByPrice.xlsx";
      XLSX.writeFile(workbook, filename);
   });

   //Sự kiện khi tải excel theo order
   $("#btn-exportCustomerByOrder").click(function () {
      var worksheet = XLSX.utils.json_to_sheet(gCustomerByOrder);
      var workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "CustomerByOrder");
      var filename = "CustomerByOrder.xlsx";
      XLSX.writeFile(workbook, filename);
   });

   //Sự kiện khi click Đăng xuất
   $("#btn-logout").on("click", function () {
      localStorage.removeItem("userSigninShop24h");
      window.location.href = `../../../home/home.html`;
   });

   /*** REGION 3 - Event handlers - Vùng khai báo các hàm xử lý sự kiện */
   function onPageLoading() {
      //Cập nhật avatar
      loadAvatar();
   }

   /*** REGION 4 - Common funtions - Vùng khai báo hàm dùng chung trong toàn bộ chương trình*/
   //REPORT CUSTOMER BY PRICE
   var dataCusTomerPrice = [
      {
         x: [""],
         y: [""],
         type: "bar",
      },
   ];

   var layoutCustomerPrice = {
      title: "Nhóm Khách Hàng Theo Giá Đơn Hàng",
      xaxis: {
         title: "Tên Khách Hàng",
      },
      yaxis: {
         title: "Tổng Giá Đơn Hàng",
      },
   };

   Plotly.newPlot("myChartByCustomerPrice", dataCusTomerPrice, layoutCustomerPrice);

   $("#btn-findCustomerByPrice").on("click", function () {
      let vGroupCustomer = $("#select-groupCustomer").val();
      callApiCustomerByPrice(vGroupCustomer);
   });

   function callApiCustomerByPrice(paramGroupCustomer) {
      $.ajax({
         url: `${gLocalhost}/customerByPrice/${paramGroupCustomer}`,
         headers: gHeader,
         type: "GET",
         success: function (res) {
            loadDataToCustomerByPrice(res);
            gCustomerByPrice = res;
         },
         error: function (xhr) {
            console.log(xhr);
         },
      });
   }

   function loadDataToCustomerByPrice(paramObj) {
      var newDataCustomerByPrice = {
         x: [paramObj.map((item) => item.fullName)],
         y: [paramObj.map((item) => item.totalPriceCustomer)],
      };

      Plotly.update("myChartByCustomerPrice", newDataCustomerByPrice);
   }

   //------------------------------------------------------------------------------------------
   //REPORT CUSTOMER BY ORDER
   var dataCusTomerOrder = [
      {
         x: [""],
         y: [""],
         type: "bar",
      },
   ];

   var layoutCustomerOrder = {
      title: "Nhóm Khách Hàng Theo Số Order",
      xaxis: {
         title: "Tên Khách Hàng",
      },
      yaxis: {
         title: "Tổng Giá Đơn Hàng",
      },
   };

   Plotly.newPlot("myChartByCustomerOrder", dataCusTomerOrder, layoutCustomerOrder);

   $("#btn-findCustomerByOrder").on("click", function () {
      let vCountOrder = $("#inp-customerByOrder").val();
      callApiCustomerByOrder(vCountOrder);
   });

   function callApiCustomerByOrder(paramCountOrder) {
      $.ajax({
         url: `${gLocalhost}/customerByCountOrder/${paramCountOrder}`,
         headers: gHeader,
         type: "GET",
         success: function (res) {
            loadDataToCustomerByOrder(res);
            gCustomerByOrder = res;
         },
         error: function (xhr) {
            console.log(xhr);
         },
      });
   }

   function loadDataToCustomerByOrder(paramObj) {
      var newDataCustomerByOrder = {
         x: [paramObj.map((item) => item.fullName)],
         y: [paramObj.map((item) => item.totalPriceCustomer)],
      };

      Plotly.update("myChartByCustomerOrder", newDataCustomerByOrder);
   }

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
});
