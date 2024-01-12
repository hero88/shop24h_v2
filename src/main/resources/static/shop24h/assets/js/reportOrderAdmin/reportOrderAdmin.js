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
   var gOrderByDate;
   var gOrderByMonth;

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

   //Sự kiện khi tải excel theo day
   $("#btn-exportPriceOrderByDate").click(function () {
      var worksheet = XLSX.utils.json_to_sheet(gOrderByDate);
      var workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "OrderByDate");
      var filename = "OrderByDate.xlsx";
      XLSX.writeFile(workbook, filename);
   });

   //Sự kiện khi tải excel theo tháng
   $("#btn-exportPriceOrderByMonth").click(function () {
      var worksheet = XLSX.utils.json_to_sheet(gOrderByMonth);
      var workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "OrderByMonth");
      var filename = "OrderByMonth.xlsx";
      XLSX.writeFile(workbook, filename);
   });

   //Sự kiện khi tải excel theo tuần
   $("#btn-exportPriceOrderByWeek").click(function () {
      var worksheet = XLSX.utils.json_to_sheet(gOrderByWeek);
      var workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "OrderByWeek");
      var filename = "OrderByWeek.xlsx";
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
   //ORDER BY DAY
   var dataDate = [
      {
         x: [""],
         y: [""],
         type: "scatter",
      },
   ];

   var layoutDate = {
      title: "Giá Đơn Hàng Theo Ngày",
      xaxis: {
         title: "Ngày",
      },
      yaxis: {
         title: "Giá Đơn Hàng",
      },
   };

   Plotly.newPlot("myChartByDate", dataDate, layoutDate);

   $("#btn-findPriceOrderByDate").on("click", function () {
      var picker = $("#reservationDate").data("daterangepicker");
      var startDateAPI = picker.startDate.format("DD-MM-YYYY");
      var endDateAPI = picker.endDate.format("DD-MM-YYYY");

      callApiPriceOrderByDate(startDateAPI, endDateAPI);
   });

   function callApiPriceOrderByDate(paramStartDate, paramEndDate) {
      $.ajax({
         url: `${gLocalhost}/orders/priceOrderByDate?startDate=${paramStartDate}&endDate=${paramEndDate}`,
         headers: gHeader,
         type: "GET",
         success: function (res) {
            loadDataToPriceOrderByDate(res);
            gOrderByDate = res;
         },
         error: function (xhr) {
            console.log(xhr);
         },
      });
   }

   function loadDataToPriceOrderByDate(paramObj) {
      var newDataDate = {
         x: [paramObj.map((item) => item.orderDate)],
         y: [paramObj.map((item) => item.totalPriceOrder)],
      };

      Plotly.update("myChartByDate", newDataDate);
   }

   //------------------------------------------------------------------------------------------
   //ORDER BY WEEK
   var dataWeek = [
      {
         x: [""],
         y: [""],
         type: "scatter",
      },
   ];

   var layoutWeek = {
      title: "Giá Đơn Hàng Theo Tuần",
      xaxis: {
         title: "Tuần",
      },
      yaxis: {
         title: "Giá Đơn Hàng",
      },
   };

   Plotly.newPlot("myChartByWeek", dataWeek, layoutWeek);

   $("#inp-startOrderWeek").weekpicker({});
   $("#inp-startOrderWeek_weekpicker").addClass("form-control");
   $("#inp-startOrderWeek_weekpicker").attr({ placeholder: "Tuần bắt đầu" });
   $("#inp-endOrderWeek").weekpicker({});

   $("#inp-endOrderWeek_weekpicker").addClass("form-control");
   $("#inp-endOrderWeek_weekpicker").attr({ placeholder: "Tuần kết thúc" });
   $("#btn-findPriceOrderByWeek").on("click", function () {
      let startWeekStr = $("#inp-startOrderWeek").val();
      var startDateParts = startWeekStr.split("/");
      var startDate = new Date(+startDateParts[2], startDateParts[1] - 1, +startDateParts[0]);
      var startWeek = Math.ceil(((startDate - new Date(startDate.getFullYear(), 0, 2)) / 86400000 + 1) / 7);

      let endWeekStr = $("#inp-endOrderWeek").val();
      var endDateParts = endWeekStr.split("/");
      var endDate = new Date(+endDateParts[2], endDateParts[1] - 1, +endDateParts[0]);

      // Tính toán số thứ tự của tuần trong năm
      var endWeek = Math.ceil(((endDate - new Date(endDate.getFullYear(), 0, 2)) / 86400000 + 1) / 7);

      callApiPriceOrderByWeek(startWeek, endWeek);
   });

   function callApiPriceOrderByWeek(paramStartWeek, paramEndWeek) {
      $.ajax({
         url: `${gLocalhost}/orders/priceOrderByWeek?startWeek=${paramStartWeek}&endWeek=${paramEndWeek}`,
         type: "GET",
         headers: gHeader,
         success: function (res) {
            loadDataToPriceOrderByWeek(res);
            gOrderByWeek = res;
         },
         error: function (xhr) {
            console.log(xhr);
         },
      });
   }

   function loadDataToPriceOrderByWeek(paramDataWeek) {
      var newDataWeek = {
         x: [paramDataWeek.map((item) => item.orderWeek)],
         y: [paramDataWeek.map((item) => item.totalPriceOrder)],
      };

      Plotly.update("myChartByWeek", newDataWeek);
   }

   //------------------------------------------------------------------------------------------
   //ORDER BY MONTH
   var dataMonth = [
      {
         x: [""],
         y: [""],
         type: "bar",
      },
   ];

   var layoutMonth = {
      title: "Giá Đơn Hàng Theo Tháng",
      xaxis: {
         title: "Tháng",
      },
      yaxis: {
         title: "Giá Đơn Hàng",
      },
   };

   Plotly.newPlot("myChartByMonth", dataMonth, layoutMonth);

   $("#inp-startOrderMonth").MonthPicker({ Button: false });

   $("#inp-endOrderMonth").MonthPicker({ Button: false });

   $("#btn-findPriceOrderByMonth").on("click", function () {
      let startMonthStr = $("#inp-startOrderMonth").val();
      let endMonthStr = $("#inp-endOrderMonth").val();
      let startMonth = startMonthStr.replace(/\//g, "-");
      let endMonth = endMonthStr.replace(/\//g, "-");

      callApiPriceOrderByMonth(startMonth, endMonth);
   });

   function callApiPriceOrderByMonth(paramStartMonth, paramEndMonth) {
      $.ajax({
         url: `${gLocalhost}/orders/priceOrderByMonth?startMonth=${paramStartMonth}&endMonth=${paramEndMonth}`,
         headers: gHeader,
         type: "GET",
         success: function (res) {
            loadDataToPriceOrderByMonth(res);
            gOrderByMonth = res;
         },
         error: function (xhr) {
            console.log(xhr);
         },
      });
   }

   function loadDataToPriceOrderByMonth(paramTotalPriceByMonth) {
      for (let bI = 0; bI < paramTotalPriceByMonth.length; bI++) {
         var [year, month] = paramTotalPriceByMonth[bI].orderMonth.split("-");
         paramTotalPriceByMonth[bI].orderMonth = month + "-" + year;
      }
      var newDataMonth = {
         x: [paramTotalPriceByMonth.map((item) => item.orderMonth)],
         y: [paramTotalPriceByMonth.map((item) => item.totalPriceOrder)],
      };

      Plotly.update("myChartByMonth", newDataMonth);
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
