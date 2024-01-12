const gLocalhost = "http://localhost:8080";

var vDetailUser;

//Kiểm tra user đã đăng nhập chưa
checkExistTokenUser();

//Kiểm tra user đăng nhập
function checkExistTokenUser() {
   var vLocalStorageUser = JSON.parse(localStorage.getItem("userSigninShop24h"));
   if (vLocalStorageUser == null) {
      window.location.href = `../../../error/error.html`;
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
      url: `${gLocalhost}/users/me`,
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
   var gBrandByDate;
   var gBrandByMonth;
   var gProductByMonth;

   /*** REGION 2 - Vùng gán / thực thi sự kiện cho các elements */
   onPageLoading();

   //Sự kiện khi click Đăng xuất
   $("#btn-logout").on("click", function () {
      localStorage.removeItem("userSigninShop24h");
      window.location.href = `../../../home/home.html`;
   });

   //Sự kiện khi click nút thu nhỏ report
   $(".btnToggle").click(function () {
      $(this).closest(".my-card").find(".my-card-body").fadeToggle();
   });

   //Sự kiện khi tải excel theo brandByDate
   $("#btn-exportBrandProductByDate").click(function () {
      console.log(123);
      var worksheet = XLSX.utils.json_to_sheet(gBrandByDate);
      var workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "BrandByDate");
      var filename = "BrandByDate.xlsx";
      XLSX.writeFile(workbook, filename);
   });

   //Sự kiện khi tải excel theo brandByMonth
   $("#btn-exportBrandProductByMonth").click(function () {
      var worksheet = XLSX.utils.json_to_sheet(gBrandByMonth);
      var workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "BrandByMonth");
      var filename = "BrandByMonth.xlsx";
      XLSX.writeFile(workbook, filename);
   });

   //Sự kiện khi tải excel theo productByMonth
   $("#btn-exportProductByMonth").click(function () {
      var worksheet = XLSX.utils.json_to_sheet(gProductByMonth);
      var workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "ProductByMonth");
      var filename = "ProductByMonth.xlsx";
      XLSX.writeFile(workbook, filename);
   });

   /*** REGION 3 - Event handlers - Vùng khai báo các hàm xử lý sự kiện */
   function onPageLoading() {
      //Cập nhật avatar
      loadAvatar();
   }
   /*** REGION 4 - Common funtions - Vùng khai báo hàm dùng chung trong toàn bộ chương trình*/
   //DATE RANGEPICKER
   $("#reservationDate").daterangepicker(
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
         autoUpdateInput: false,
      },
      function (start, end, label) {
         // Sử dụng start và end để cập nhật giá trị input
         var startDate = start.format("DD/MM/YYYY");
         var endDate = end.format("DD/MM/YYYY");
         $("#reservationDate").val(startDate + " - " + endDate);
      }
   );

   // Set default value
   $("#reservationDate").val("Ngày Bắt Đầu - Ngày Kết Thúc");

   //------------------------------------------------------------------------------------------
   //BRAND BY DAY

   $("#btn-findBrandProductByDate").on("click", function () {
      var picker = $("#reservationDate").data("daterangepicker");
      var startDateAPI = picker.startDate.format("DD-MM-YYYY");
      var endDateAPI = picker.endDate.format("DD-MM-YYYY");

      callApiBrandProductByDate(startDateAPI, endDateAPI);
   });

   function callApiBrandProductByDate(paramStartDate, paramEndDate) {
      $.ajax({
         url: `${gLocalhost}/product/totalBrandProductByDate?startDate=${paramStartDate}&endDate=${paramEndDate}`,
         headers: gHeader,
         type: "GET",
         success: function (res) {
            loadDataBrandProductByDate(res);
            gBrandByDate = res;
         },
         error: function (xhr) {
            console.log(xhr);
         },
      });
   }

   function loadDataBrandProductByDate(paramDataDate) {
      pieData.labels = [];
      pieData.datasets[0].data = [];
      paramDataDate.forEach(function (item) {
         pieData.labels.push(item.productVendor);
         pieData.datasets[0].data.push(item.total);
      });

      pieChartByDate.destroy();

      // Tạo biểu đồ donut mới và gán lại cho donutChartCanvas
      new Chart(pieChartCanvas, {
         type: "pie",
         data: pieData,
         options: pieOptions,
      });
   }

   //- PIE CHART -
   var pieChartCanvas = $("#pieChart").get(0).getContext("2d");
   var pieData = {
      labels: ["Apple", "SamSung", "Xiaomi", "Oppo", "Garmin"],
      datasets: [
         {
            data: [700, 500, 400, 600, 300],
            backgroundColor: ["#B80000", "#98FB98", "#FFD700", "#FF00FF", "#0000CD"],
         },
      ],
   };
   var pieOptions = {
      maintainAspectRatio: false,
      responsive: true,
   };
   //Create pie or douhnut chart
   // You can switch between pie and douhnut using the method below.
   var pieChartByDate = new Chart(pieChartCanvas, {
      type: "pie",
      data: pieData,
      options: pieOptions,
   });

   //------------------------------------------------------------------------------------------
   //PRODUCT BY MONTH

   //Bar Chart
   var dataMonth = [
      {
         x: [""],
         y: [""],
         type: "bar",
      },
   ];

   var layoutMonth = {
      title: "Sản Phẩm Theo Tháng",
      xaxis: {
         title: "",
      },
      yaxis: {
         title: "",
      },
   };

   Plotly.newPlot("myChartProductByMonth", dataMonth, layoutMonth);

   $("#inp-startProductMonth").MonthPicker({ Button: false });

   $("#inp-endProductMonth").MonthPicker({ Button: false });

   $("#btn-findProductByMonth").on("click", function () {
      let startMonthStr = $("#inp-startProductMonth").val();
      let endMonthStr = $("#inp-endProductMonth").val();
      let startMonth = startMonthStr.replace(/\//g, "-");
      let endMonth = endMonthStr.replace(/\//g, "-");

      callApiProductByMonth(startMonth, endMonth);
   });

   function callApiProductByMonth(paramStartMonth, paramEndMonth) {
      $.ajax({
         url: `${gLocalhost}/product/totalProductByMonth?startMonth=${paramStartMonth}&endMonth=${paramEndMonth}`,
         headers: gHeader,
         type: "GET",
         success: function (res) {
            loadDataToProductByMonth(res);
            gProductByMonth = res;
         },
         error: function (xhr) {
            console.log(xhr);
         },
      });
   }

   function loadDataToProductByMonth(paramDataByMonth) {
      var newDataMonth = {
         x: [paramDataByMonth.map((item) => item.productName)],
         y: [paramDataByMonth.map((item) => item.total)],
      };

      Plotly.update("myChartProductByMonth", newDataMonth);
   }

   //------------------------------------------------------------------------------------------
   //BRAND BY MONTH

   $("#inp-startBrandtMonth").MonthPicker({ Button: false });

   $("#inp-endBrandMonth").MonthPicker({ Button: false });

   $("#btn-findBrandByMonth").on("click", function () {
      let startMonthStr = $("#inp-startBrandtMonth").val();
      let endMonthStr = $("#inp-endBrandMonth").val();
      let startMonth = startMonthStr.replace(/\//g, "-");
      let endMonth = endMonthStr.replace(/\//g, "-");

      callApiBrandProductByMonth(startMonth, endMonth);
   });

   function callApiBrandProductByMonth(paramStartMonth, paramEndMonth) {
      $.ajax({
         url: `${gLocalhost}/product/totalBrandProductByMonth?startMonth=${paramStartMonth}&endMonth=${paramEndMonth}`,
         headers: gHeader,
         type: "GET",
         success: function (res) {
            loadDataBrandProductByMonth(res);
            gBrandByMonth = res;
         },
         error: function (xhr) {
            console.log(xhr);
         },
      });
   }

   function loadDataBrandProductByMonth(paramTotalPriceByMonth) {
      donutData.labels = [];
      donutData.datasets[0].data = [];
      paramTotalPriceByMonth.forEach(function (item) {
         donutData.labels.push(item.productVendor);
         donutData.datasets[0].data.push(item.total);
      });

      donutChartByMonth.destroy();

      // Tạo biểu đồ donut mới và gán lại cho donutChartCanvas
      new Chart(donutChartCanvas, {
         type: "doughnut",
         data: donutData,
         options: donutOptions,
      });
   }

   //- DONUT CHART -
   var donutChartCanvas = $("#donutChart").get(0).getContext("2d");
   var donutData = {
      labels: ["Apple", "SamSung", "Xiaomi", "Oppo", "Garmin"],
      datasets: [
         {
            data: [700, 500, 400, 600, 300],
            backgroundColor: ["#f56954", "#00a65a", "#f39c12", "#00c0ef", "#3c8dbc"],
         },
      ],
   };
   var donutOptions = {
      maintainAspectRatio: false,
      responsive: true,
   };
   //Create pie or douhnut chart
   // You can switch between pie and douhnut using the method below.
   var donutChartByMonth = new Chart(donutChartCanvas, {
      type: "doughnut",
      data: donutData,
      options: donutOptions,
   });

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
