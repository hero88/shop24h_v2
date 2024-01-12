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

$(document).ready(function () {
   /*** REGION 1 - Global variables - Vùng khai báo biến, hằng số, tham số TOÀN CỤC */
   var gOrder;
   var gOrderId;
   var isErrorDisplay = true;
   var isProductExist = false; // Khởi tạo biến isProductExist với giá trị ban đầu là false

   /*** REGION 2 - Vùng gán / thực thi sự kiện cho các elements */
   onPageLoading();

   //Sự kiện khi click Đăng xuất
   $("#btn-logout").on("click", function () {
      localStorage.removeItem("userSigninShop24h");
      window.location.href = "../../../home/home.html";
   });

   // Bắt sự kiện khi click vào nút thêm sản phẩm
   $("#btn-addProduct").on("click", function () {
      var stopExecution = false;
      var selectedText = $("#select-addProduct :selected").text();
      var selectedValue = $("#select-addProduct :selected").val();

      // Kiểm tra xem có sản phẩm đã tồn tại trong danh sách hay không
      $(".item-productName").each(function () {
         if ($(this).text() == selectedText) {
            stopExecution = true;
            return;
         }
      });

      // Nếu sản phẩm đã tồn tại, dừng thực thi và hiển thị thông báo
      if (stopExecution) {
         if (!isProductExist) {
            $("#select-addProduct").parent().append(`<p style="color:red"> Đã có sản phẩm trong đơn hàng </p>`);
            isProductExist = true;
         }
         return false;
      } else {
         // Nếu sản phẩm chưa tồn tại, xoá thông báo cũ (nếu có) và gọi API để lấy thông tin sản phẩm
         $("#select-addProduct").parent().find("p").remove();
         isProductExist = false;

         if (selectedValue != 0) {
            callApiProductByProductId(selectedValue);
         }
      }
   });

   //sự kiện click cho phím plus tăng đơn vị  nhưng không lớn hơn quantityInStock
   //Thay đổi giá tổng và giỏ hàng trên cilent
   $("#contain-orderDetail").on("click", ".fa-circle-plus", function () {
      var currentVal = parseInt($(this).siblings(".inp-quantityItem").val());
      var vQantityInStock = parseInt($(this).closest(".item-orderDetail").find(".span-quantityInStock").text());

      if (currentVal < vQantityInStock) {
         $(this)
            .siblings(".inp-quantityItem")
            .val(currentVal + 1);
      } else {
         $(this).siblings(".inp-quantityItem").val(vQantityInStock);
      }

      //thay đổi tổng tiền trên cilent
      getTotalOrderPrice();
   });

   //sự kiện click phím minus giảm đơn vị  nhưng không nhỏ hơn 1
   //Sự kiện khi thẻ input thay đổi tính tổng giá trị item và item trên giỏ hàng cilent
   $("#contain-orderDetail").on("click", ".fa-circle-minus", function () {
      var currentVal = parseInt($(this).siblings(".inp-quantityItem").val());
      if (currentVal > 1) {
         $(this)
            .siblings(".inp-quantityItem")
            .val(currentVal - 1);
      } else {
         $(this).siblings(".inp-quantityItem").val(1);
      }

      //thay đổi tổng tiền trên cilent
      getTotalOrderPrice();
   });

   //Sự kiện khi thẻ quantity thay đổi tính tổng giá trị item
   $("#contain-orderDetail").on("change", ".inp-quantityItem", function () {
      var vValueInput = parseInt($(this).val());
      var vQantityInStock = parseInt($(this).closest(".item-orderDetail").find(".span-quantityInStock").text());

      if (isNaN(vValueInput) || vValueInput == 0) {
         $(this).val(1);
      }

      if (vValueInput > vQantityInStock) {
         $(this).val(vQantityInStock);
      }
      getTotalOrderPrice();
   });

   //Sự kiện khi click nút xóa trên item OrderDetail
   $("#contain-orderDetail").on("click", ".fa-square-minus", function () {
      $(this).closest(".item-orderDetail").remove();
      getTotalOrderPrice();
   });

   //Khi select province thay đổi, load dữ liệu quận vào
   $("#select-province").on("change", function () {
      //Xóa select ward
      let vWard = $("#select-ward");
      vWard.empty();
      vWard.append(`<option value=0>Phường/Xã</option>`);

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

   //Sự kiện khi click vào button cập nhật
   $("#btn-update").on("click", function () {
      let vData = getDataFromForm();
      let vValidate = validateInfoOrder(vData);

      if (vValidate) {
         callApiUpdateOrder(vData);
      }
   });

   /*** REGION 3 - Event handlers - Vùng khai báo các hàm xử lý sự kiện */
   function onPageLoading() {
      //Gọi Api all Province
      callApiAllProvince();
      //Lấy thông tin orderId từ URL
      getOrderIdFormUrl();
      //Gọi API của Sản phẩm vào Select Thêm
      callApiProductToSelectAdd();
      //Cập nhật avatar
      loadAvatar();
   }

   /*** REGION 4 - Common funtions - Vùng khai báo hàm dùng chung trong toàn bộ chương trình*/
   function callApiOrderByOrderId(paramOrderId) {
      $.ajax({
         async: false,
         url: `${gLocalhost}/order/${paramOrderId}`,
         type: "GET",
         success: function (res) {
            console.log(res);
            gOrder = res;
            //Load dữ liệu của orderId lấy từ URL vào thông tin form
            loadDataToFormInfo(res);
         },
         error: function (xhr) {
            console.log(xhr);
         },
      });
   }

   //Gọi API của Sản phẩm vào Select Thêm
   function callApiProductToSelectAdd() {
      $.ajax({
         url: `${gLocalhost}/products`,
         type: "GET",
         success: function (res) {
            //load dữ liệu vào Select Add
            loadDataToSelectAdd(res);
         },
         error: function (xhr) {
            console.log(xhr);
         },
      });
   }

   //Gọi Api sản phẩm từ productId
   function callApiProductByProductId(paramProductId) {
      $.ajax({
         url: `${gLocalhost}/productByProductId/${paramProductId}`,
         type: "GET",
         success: function (res) {
            //Load dữ liệu vào nơi chứa Order Detail sau khi click button Add
            loadDataToContainOrderDetail(res, "1");
            getTotalOrderPrice();
         },
         error: function (xhr) {
            console.log(xhr);
         },
      });
   }

   //Gọi API Tất Cả Province
   function callApiAllProvince() {
      $.ajax({
         async: false,
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
         async: false,
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
         async: false,
         type: "GET",
         url: `${gLocalhost}/wards/${paramDistrictId}`,
         success: function (res) {
            loadDataToSelectWard(res);
         },
      });
   }

   //Gọi Api update Order và Order Detail
   function callApiUpdateOrder(paramDataOrder) {
      $.ajax({
         type: "PUT",
         headers: gHeader,
         url: `${gLocalhost}/updateOrder/order/${gOrderId}/province/${paramDataOrder.provinceId}/district/${paramDataOrder.districtId}/ward/${paramDataOrder.wardId}`,
         contentType: "application/json",
         data: JSON.stringify(paramDataOrder),
         success: function (responseOrder) {
            console.log(responseOrder);
            $.ajax({
               type: "DELETE",
               headers: gHeader,
               url: `${gLocalhost}/deleteOrderDetail/${gOrderId}`,
               success: function (res) {
                  paramDataOrder.productItem.forEach((product) => {
                     $.ajax({
                        type: "POST",
                        url: `${gLocalhost}/orderDetail/product/${product.productId}/order/${responseOrder.id}`,
                        contentType: "application/json",
                        data: JSON.stringify(product),
                        success: function (responseOrderDetail) {
                           console.log(responseOrderDetail);
                        },
                     });
                  });
                  showNotice("Cập Nhật Thành Công");
               },
            });
         },
      });
   }

   //Lấy thông tin orderId từ URL
   function getOrderIdFormUrl() {
      var vUrlString = window.location.href;
      var vUrl = new URL(vUrlString);
      var vOrderId = vUrl.searchParams.get("orderId");
      gOrderId = vOrderId;
      //Call api theo orderId
      callApiOrderByOrderId(vOrderId);
   }

   //Tính Tổng Giá Tiền và hiển thị Tổng Giá
   function getTotalOrderPrice() {
      var vTotalPrice = 0;
      $(".item-priceOrder").each(function () {
         var vText = $(this).text();
         var vPrice = vText.slice(0, -2).replace(/,/g, "");
         var vQuantity = $(this).closest(".item-orderDetail").find(".inp-quantityItem").val();

         vTotalPrice += Number(vPrice) * vQuantity;
      });
      $("#inp-totalPrice").text(vTotalPrice.toLocaleString() + " đ");
   }

   //Lấy giá trị từ form người dùng để cập nhật order
   function getDataFromForm() {
      vData = {};
      vData.address = $("#inp-address").val();
      vData.comments = $("#textarea-comments").val();
      vData.provinceId = $("#select-province").val();
      vData.districtId = $("#select-district").val();
      vData.wardId = $("#select-ward").val();
      vData.productItem = [];
      $(".item-id").each(function () {
         vData.productItem.push({
            productId: $(this).text(),
            quantityOrder: $(this).siblings(".inp-quantityItem").val(),
            priceEach: changeNumber($(this).closest(".item-orderDetail").find(".item-priceOrder").text()),
         });
      });
      return vData;
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

   //Load dữ liệu của orderId lấy từ URL vào thông tin form
   function loadDataToFormInfo(paramData) {
      $("#inp-fullName").val(paramData.customerName);
      $("#inp-phoneNumber").val(paramData.phoneNumber);
      $("#inp-email").val(paramData.email);
      $("#inp-orderCode").val(paramData.orderCode);
      $("#inp-orderDate").val(paramData.orderDate);
      $("#inp-address").val(paramData.address);
      $("#textarea-comments").val(paramData.comments);

      for (let orderDetail of paramData.orderDetails) {
         $.ajax({
            url: `${gLocalhost}/productByProductId/${orderDetail.productId}`,
            type: "GET",
            success: function (res) {
               loadDataToContainOrderDetail(res, orderDetail.quantityOrder);
            },
            error: function (xhr) {
               console.log(xhr);
            },
         });
      }

      callApiDistrictByProvinceId(paramData.provinceId);
      callApiWardByDistrictId(paramData.districtId);
      $("#select-province").val(paramData.provinceId);
      $("#select-district").val(paramData.districtId);
      $("#select-ward").val(paramData.wardId);
      $("#inp-totalPrice").text(paramData.totalPriceOrder.toLocaleString() + " đ");
   }

   //Load dữ liệu vào nơi chứa Order Detail
   function loadDataToContainOrderDetail(paramDataOrderDetail, paramQuantityOrder) {
      $("#contain-orderDetail").append(
         `<div class="row mb-4 item-orderDetail" style="position:relative; background-color:white; border-radius:20px; box-shadow: 5px 5px 10px #888888">
          
            <span style="position: absolute; top: 5px; right: 0px; z-index: 100; color:red; cursor: pointer;"><i class="fa-solid fa-square-minus"></i></span>
            
            <div class="col-lg-1 col-md-2 col-sm-3 col-4"   style="padding:1rem">
                <img src="${gLocalhost}/product-photos/${
                   paramDataOrderDetail.productImg[0]
                }" alt="" class="img-fluid" />
            </div>

            <div class="col-lg-6  col-md-7  col-8 ">
                <h5 class="item-productName">${paramDataOrderDetail.productName}</h5>
                <h6 style="color: red"><strong class="item-priceOrder"> ${paramDataOrderDetail.buyPrice.toLocaleString()} đ </strong></h6>
                <div class="d-flex align-items-center">
                    <i class="fa-solid fa-circle-minus " style="font-size: 1.5rem; cursor: pointer"></i>
                    <input
                        type="text"
                        class="form-control mx-3 text-center inp-quantityItem"
                        style="width: 60px"
                        value="${paramQuantityOrder}"
                        onkeypress="return event.charCode >= 48 && event.charCode <= 57"
                    />
                    <i class="fa-sharp fa-solid fa-circle-plus " style="font-size: 1.5rem; cursor: pointer"></i>
                    <p style="display:none" class="item-id">${paramDataOrderDetail.id}</p>

                </div>
                <div class="d-flex">
                    <p class="mt-2">Sản phẩm có sẵn:&nbsp</p>
                    <p class="span-quantityInStock mt-2">${paramDataOrderDetail.quantityInStock}</p>
                </div>
            </div>
        </div>`
      );
   }

   //load dữ liệu vào Select Add
   function loadDataToSelectAdd(paramProduct) {
      $("#select-addProduct").append(`<option value="0"> --- Thêm Sản Phẩm --- </option>`);
      for (product of paramProduct) {
         $("#select-addProduct").append(`<option value="${product.id}">${product.productName}</option>`);
      }
   }
   //Load dữ liệu vào Select Province
   function loadDataToSelectProvince(paramProvince) {
      for (province of paramProvince) {
         $("#select-province").append(`<option value="${province.id}">${province.name}</option>`);
      }
   }

   //Tải dữ liệu vào select District theo ProvinceId
   function loadDataToSelectDistrict(paramDistrict) {
      let vDistrict = $("#select-district");
      vDistrict.append(`<option value=0>Quận/Huyện</option>`);
      paramDistrict.forEach((district) => vDistrict.append(`<option value=${district.id}>${district.name}</option>`));
   }

   //Tải dữ liệu vào select Ward theo ProvinceId
   function loadDataToSelectWard(paramWard) {
      let vWard = $("#select-ward");
      vWard.append(`<option value=0>Phường/Xã</option>`);
      paramWard.forEach((ward) => vWard.append(`<option value=${ward.id}>${ward.name}</option>`));
   }

   //Kiểm tra dữ liệu trong thông tin order trước khi cập nhật
   function validateInfoOrder() {
      var vDistrict = $("#select-district");
      var vWard = $("#select-ward");
      var vAddress = $("#inp-address");

      // Thêm sự kiện blur cho trường #select-district
      vDistrict.on("change", function () {
         if ($(this).val() != "0") {
            // Xóa thẻ <p> hiển thị lỗi
            $(this).siblings("p").remove();
            isErrorDisplay = true;
         }
      });

      if (vDistrict.val() == 0) {
         if (isErrorDisplay) {
            vDistrict
               .closest(".form-group")
               .children()
               .eq(1)
               .append(`<p style="color:red; font-size: 0.8rem">Chọn Quận, Huyện</p>`);
            vDistrict.focus();
            isErrorDisplay = false;
         }
         return false;
      }

      // Thêm sự kiện blur cho trường #select-ward
      vWard.on("change", function () {
         if ($(this).val() != "0") {
            // Xóa thẻ <p> hiển thị lỗi
            $(this).siblings("p").remove();
            isErrorDisplay = true;
         }
      });

      if (vWard.val() == 0) {
         if (isErrorDisplay) {
            vWard
               .closest(".form-group")
               .children()
               .eq(1)
               .append(`<p style="color:red; font-size: 0.8rem">Chọn Phường Xã</p>`);
            vWard.focus();
            isErrorDisplay = false;
         }
         return false;
      }

      // Thêm sự kiện blur cho trường #inp-address
      vAddress.on("blur", function () {
         if ($(this).val() != "") {
            // Xóa thẻ <p> hiển thị lỗi
            $(this).siblings("p").remove();
            isErrorDisplay = true;
         }
      });

      if (vAddress.val() == "") {
         if (isErrorDisplay) {
            vAddress
               .closest(".form-group")
               .children()
               .eq(1)
               .append(`<p style="color:red; font-size: 0.8rem">Nhập Địa Chỉ</p>`);
            vAddress.focus();
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

   //Chuyển String giá tiền thành String không phẩy
   function changeNumber(paramString) {
      let vNumber = paramString.slice(0, -2).replace(/,/g, "").trim();
      return vNumber;
   }
});
