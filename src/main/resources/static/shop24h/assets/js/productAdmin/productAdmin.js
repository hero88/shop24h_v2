const gLocalhost = "https://shop24hv2-production.up.railway.app";
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
      url: `${gLocalhost}/users/me`,
      type: "GET",
      async: false,
      headers: paramHeader,
      success: function (res) {
         
         vDetailUser = res;
         console.log("1 ===>");
         console.log(vDetailUser);
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

//---------------------- INPUT NUMBER --------------------------
function formatNumber(input) {
   var num = input.value.replace(/\D/g, "");
   var formattedNum = Number(num).toLocaleString("en");
   input.value = formattedNum;
}

$(document).ready(function () {

  
   var vTable = $("#product-table").DataTable({});

   /*** REGION 1 - Global variables - Vùng khai báo biến, hằng số, tham số TOÀN CỤC */
   var gProductIdClick;
   var gListImgAdd =  [];
   var gListImgUpdate = [];
   var gListNameImgOld = [];
   var gListNameImgRemove = [];

   /*** REGION 2 - Vùng gán / thực thi sự kiện cho các elements */
   onPageLoading();

   //Sự kiện khi click Đăng xuất
   $("#btn-logout").on("click", function () {
      localStorage.removeItem("userSigninShop24h");
      window.location.href = "../../../home/home.html";
   });

   // --------------------- SỰ KIỆN CHUNG --------------------------------

   //Sự kiện khi click tìm kiếm
   $("#btn-find").on("click", function () {
      let vProductLineId = $("#select-productLine").val();
      let vKeyName = $("#inp-find").val();
      let vUrl = `${gLocalhost}/product/AminSearch/productLine/${vProductLineId}?keyName=${vKeyName}`;
      vTable = loadTable(vUrl);
   });

   // --------------------- RATY --------------------------------

   //Khi click vào star rating
   $("#product-table").on("click", ".star-rating", function () {
      $("#rating-modal").modal("show");
      $(".item-headerRating").removeClass("activeRating");
      $(".item-headerRating").eq(0).addClass("activeRating");
      getDataRow(this);
      callApiRatingProductByNumber("5");
   });

   //Khi click vào số sao trong modal
   $(".item-headerRating").on("click", function () {
      // Xóa lớp activeRating khỏi tất cả các item-headerRating
      $(".item-headerRating").removeClass("activeRating");

      // Thêm lớp activeRating vào item-headerRating được nhấp
      $(this).addClass("activeRating");
      var vRating = $(this).data("rating");
      //Gọi Api theo product và số điểm sao
      callApiRatingProductByNumber(vRating);
   });

   //Khi click nút Xóa comment
   $("#rating-modal").on("click", ".rating-delete", function () {
      let vIdComment = $(this).siblings(".ratingId").text();
      let vParenComment = $(this).parent();
      callApiDeleteRatingById(vIdComment, vParenComment);
   });

   // --------------------- UPDATE --------------------------------
   //Sự kiện khi click vào nút cập nhật trên table
   $("#product-table").on("click", ".update-fa", function () {
      gListImgUpdate = [];
      gListNameImgOld = [];
      gListNameImgRemove = [];
      $("#updateProduct-modal").modal("show");
      $(".notice-warning").remove();
      vIsDisplay = true;
      let vDataRow = getDataRow(this);
      loadDataToModalUpdate(vDataRow);
   });

   //Sự kiện khi click nút update trên modal update
   $("#btn-update-modal").on("click", function () {
      let vData = getDataInUpdateModal();
      let vValidate = valvValidateData("update");
      if (vValidate) {
         callApiUpdateProduct(vData);
      }
   });

   //Sự kiện khi click button cập nhật file trong modal update
   $("#inp-update-file").on("change", function () {
      previewImagesUpdate(this);
   });

   function previewImagesUpdate(input) {
      let preview = $(".img-update-modal");

      if (input.files) {
         let filesAmount = input.files.length;

         for (let i = 0; i < filesAmount; i++) {
            let reader = new FileReader();
            reader.onload = function(e) {
               let vKeyRandom = Math.floor(Math.random() * 9999) + 1;
               let imageHtml = `
                     <div class="col-4 pt-2" style="position:relative">
                        <img src="${e.target.result}" alt="" class="img-fluid img-insert-preview"  data-key-random=${vKeyRandom}>
                        <i class="fa-regular fa-circle-xmark remove-update-img" style="position: absolute; top: 0; right: 10px; color:red"></i>               
                     </div>`;
               $(imageHtml).appendTo(preview);
               gListImgUpdate.push({ file: input.files[i], keyRandom: vKeyRandom });            }

            reader.readAsDataURL(input.files[i]);
         }
      }
   }

   $(".img-update-modal").on("click", ".remove-update-img", function() {
      // Xác định phần tử cha chứa hình ảnh và icon xóa
      let parentDiv = $(this).closest(".col-4");
      let img = parentDiv.find("img");
      let vKeyRandom = img.data("key-random");

      // Lấy đường dẫn của hình ảnh
      let imgSrc = img.attr("src");
      // Tách đường dẫn để lấy tên tập tin
      let imgFileName = imgSrc.split("/").pop();

      if (gListNameImgOld.includes(imgFileName)) {
         gListNameImgRemove.push(imgFileName);
      }

      // Xóa các file mới cập nhật khỏi mảng gListImgUpdate
      removeFileFromList(vKeyRandom, gListImgUpdate);

      // Xóa phần tử cha khỏi DOM
      parentDiv.remove();


      // if(gListImgAdd.length <= 5){
      //    vIsDisplay = true;
      //    $(".warning-max-img").remove();
      //
      // }


   });

   // --------------------- DELETE --------------------------------
   //Sử kiện khi click vào nút xóa trên table
   $("#product-table").on("click", ".delete-fa", function () {
      $("#deleteProduct-modal").modal("show");
      getDataRow(this);
   });

   //Sự kiện khi nút button Xóa trong modal delete
   $("#btn-delete-modal").on("click", function () {
      callApiDeleteProduct();
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
      gListImgAdd = [];

      $(".notice-warning").remove();

      vIsDisplay = true;
   });

   //Sự kiện khi click nút thêm trong modal
   $("#btn-insert-modal").on("click", function () {
      
      let vValidate = valvValidateData("insert");
      if (vValidate) {
         let vFormData = getDataInInsertModal();
         callApiCreateProduct(vFormData);
      } 
      // uploadFile();

   });


   //Sự kiện khi click button cập nhật file hình ảnh trong modal add
   $("#inp-insert-file").change(function() {
      previewImagesAdd(this);
   });


   function previewImagesAdd(input) {
      let preview = $(".img-insert-modal");

      if (input.files) {
         let filesAmount = input.files.length;
         for (let i = 0; i < filesAmount; i++) {
            let reader = new FileReader();
            reader.onload = function(e) {
               let vKeyRandom = Math.floor(Math.random() * 9999) + 1;
               let imageHtml = `
                     <div class="col-4 pt-2" style="position:relative">
                        <img src="${e.target.result}" alt="" class="img-fluid img-insert-preview"  data-key-random=${vKeyRandom}>
                        <i class="fa-regular fa-circle-xmark remove-add-img" style="position: absolute; top: 0; right: 10px; color:red"></i>               
                     </div>`;
                  $(imageHtml).appendTo(preview);
                  gListImgAdd.push({ file: input.files[i], keyRandom: vKeyRandom });            }
     
            reader.readAsDataURL(input.files[i]);
         }
      }
   }

   $(".img-insert-modal").on("click", ".remove-add-img", function() {
      // Xác định phần tử cha chứa hình ảnh và icon xóa
      let parentDiv = $(this).closest(".col-4");   
      let img = parentDiv.find("img");
      let vKeyRandom = img.data("key-random");
      // Xóa phần tử cha khỏi DOM
      parentDiv.remove();
   
      // Xóa file khỏi mảng gListImgAdd
      removeFileFromList(vKeyRandom, gListImgAdd);

      if(gListImgAdd.length <= 5){
         vIsDisplay = true;
         $(".warning-max-img").remove();

      }

   
   });

   function removeFileFromList(paramRandomString, paramList) {
      let index = paramList.findIndex(function(fileObj) {
         return fileObj.keyRandom === paramRandomString;
      });
   
      // Nếu tìm thấy index, xóa file khỏi mảng
      if (index !== -1) {
         paramList.splice(index, 1);
      }
   }




   // --------------------- DETAIL --------------------------------
   //Xử lý chức năng chi tiết product
   $("#product-table").on("click", ".fa-detail", function () {
      //truy xuất hàng của chính button này
      var vRowClick = $(this).closest("tr");
      //truy xuất hàng này trong bảng table
      var vRowTable = vTable.row(vRowClick);

      //Nếu hàng con đã hiển thị thì ẩn nó đi
      if (vRowTable.child.isShown()) {
         vRowTable.child.hide();
         vRowClick.removeClass("shown");
      } else {
         vRowClick.addClass("shown");
         vRowTable.child(showInfoInRowChild(vRowTable.data())).show();
      }
   });

   /*** REGION 3 - Event handlers - Vùng khai báo các hàm xử lý sự kiện */
   function onPageLoading() {
      callApiAllProductLine();
      vTable = loadTable(`${gLocalhost}/productsAndPanagation`);
      //Cập nhật avatar
      loadAvatar();
   }

   /*** REGION 4 - Common funtions - Vùng khai báo hàm dùng chung trong toàn bộ chương trình*/
   // ------------------------------ CALL API ----------------------------------------------

   function callApiAllProductLine() {
      $.ajax({
         url: `${gLocalhost}/productLines`,
         type: "GET",
         success: function (res) {
            loadDataToSelectProductLine(res);
            loadDataToSelectProductLineInModal(res);
         },
         error: function (xhr) {
            console.log(xhr);
         },
      });
   }

   function callApiCreateProduct(paramProduct) {
      $.ajax({
         url: `${gLocalhost}/createProduct/${paramProduct.get("productLineId")}`,
         type: "POST",
         data: paramProduct,
         processData: false, // Không xử lý dữ liệu
         contentType: false, // Không đặt loại nội dung
         success: function (res) {
            $("#insertProduct-modal").modal("hide");
            showNotice("Tạo Sản Phẩm Thành Công");
   
            vTable.ajax.reload(null, false); // Cập nhật lại bảng mà không làm mất trang hiện tại
         }, 
         error: function (xhr) {
            // Xử lý khi tạo thất bại
            handleFailCreateProduct(xhr, "insert");
         },
      });
   }
   
   function callApiDeleteProduct(paramProductId) {
      $.ajax({
         headers: gHeader,
         url: `${gLocalhost}/deleteProduct/${gProductIdClick}`,
         type: "DELETE",
         success: function (res) {
            $("#deleteProduct-modal").modal("hide");
            showNotice("Đã Xóa Sản Phẩm");
            vTable.ajax.reload(null, false); // Cập nhật lại bảng mà không làm mất trang hiện tại
         },
      });
   }

   function callApiUpdateProduct(paramProduct) {
      $.ajax({
         url: `${gLocalhost}/updateProduct/${gProductIdClick}`,
         type: "PUT",
         headers: gHeader,
         contentType: "application/json",
         data: JSON.stringify(paramProduct),
         success: function (res) {
            $("#updateProduct-modal").modal("hide");
            showNotice("Cập Nhật Thành Công");

            vTable.ajax.reload(null, false); // Cập nhật lại bảng mà không làm mất trang hiện tại
         },
         error: function (xhr) {
            handleFailCreateProduct(xhr, "update");
         },
      });
   }

   //Gọi Api theo product và số điểm sao
      function callApiRatingProductByNumber(paramNumber) {
         $.ajax({
            url: `${gLocalhost}/rating/${gProductIdClick}/${paramNumber}`,
            type: "GET",
            success: function (res) {
               loadRatingByNumber(res);
            },
            error: function (xhr) {
               console.log(xhr);
            },
         });
      }

   //Gọi API xóa rating
   function callApiDeleteRatingById(paramId, paramParent) {
      $.ajax({
         headers: gHeader,
         type: "DELETE",
         url: `${gLocalhost}/rating/deleteRating/${paramId}`,
         success: function (res) {
            $(paramParent).remove();
            vTable.ajax.reload(null, false); // Cập nhật lại bảng mà không làm mất trang hiện tại
         },
         error: function (xhr) {
            alert(xhr.responseText);
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

   function loadTable(url) {
      var currentPageStartIndex = 0;

      vTable.destroy();
      return $("#product-table").DataTable({
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
               for (var key in gHeader) {
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
            { data: "productCode" },
            { data: "productName" },
            { data: "productVendor" },
            { data: "averageRating" },
            { data: "buyPrice" },
            { data: "quantityInStock" },
            { data: "Cập Nhật" },
            { data: "Chi tiết" },
         ],
         columnDefs: [
            { targets: [0, 1, 2, 3, 4, 5, 6, 7, 8], class: "text-center" },
            {
               targets: 0,
               render: function (data, type, row, meta) {
                  // Sử dụng meta.row để lấy chỉ số của hàng
                  return currentPageStartIndex + meta.row + 1;
               },
            },

            {
               targets: 4,
               render: function (data) {
                  var starRating = $(`<div class="star-rating"></div> `);
                  $(starRating).raty({
                     path: `/images/`,
                     score: data,
                     readOnly: true,
                     hints: [data, data, data, data, data],
                  });
                  return $(starRating)[0].outerHTML;
               },
            },

            {
               targets: 5,
               render: function (data) {
                  return data.toLocaleString() + " đ";
               },
            },

            {
               targets: 7,
               defaultContent: `<i class=" fa-sharp fa-solid fa-pen-to-square update-fa text-info" title="Sửa" style="cursor: pointer"></i>&nbsp;&nbsp;&nbsp;
              <i class=" fa-solid fa-trash delete-fa text-danger" title="Xóa" style="cursor: pointer"></i>`,
            },
            {
               targets: 8,
               defaultContent: `<i class="fa-solid fa-circle-info fa-detail" title="Show/Hide Detail" style="cursor: pointer"></i>`,
            },
         ],
         preDrawCallback: function (settings) {
            var api = new $.fn.dataTable.Api(settings);
            currentPageStartIndex = api.page.info().start;
         },
      });
   }

   function loadDataToSelectProductLine(paramProductLine) {
      var vSelect = $("#select-productLine");
      vSelect.append(`<option value="0">All</option>`);
      for (let product of paramProductLine) {
         vSelect.append(`<option value="${product.id}">${product.productLineName}</option>`);
      }
   }

   function loadDataToSelectProductLineInModal(paramProductLine) {
      var vSelect = $("#select-insert-productLine");
      for (let product of paramProductLine) {
         vSelect.append(`<option value="${product.id}">${product.productLineName}</option>`);
      }
   }

   function loadDataToModalUpdate(paramData) {
      $("#inp-update-code").val(paramData.productCode);
      $("#inp-update-name").val(paramData.productName);
      $("#inp-update-buyPrice").val(paramData.buyPrice.toLocaleString());
      $("#inp-update-quantityInStock").val(paramData.quantityInStock.toLocaleString());
      $("#text-update-description").val(paramData.productDescripttion);
      $("#select-update-vendor option").removeAttr("selected");
      $("#select-update-vendor option:contains('" + paramData.productVendor + "')").attr("selected", true);

      $(".img-update-modal").empty();
      for (let bI = 0; bI < paramData.productImg.length; bI++) {
         let vKeyRandom = Math.floor(Math.random() * 9999) + 1;
         $(".img-update-modal").append(
         `<div class="col-4 pt-2" style="position:relative">
         <img
            src="/images/${paramData.productImg[bI]}"
            alt=""  
            class="img-fluid"
            data-key-random=${vKeyRandom}
         />
         <i class="fa-regular fa-circle-xmark remove-update-img" style="position: absolute; top: 0; right: 10px; color:red; cursor: pointer"></i>
      </div>`
         );
         gListNameImgOld.push(paramData.productImg[bI]);
      }

      $("#inp-update-file").val("");
   }

   //Tải rating vào div
   function loadRatingByNumber(paramData) {
      $(".body-rating").html("");
      if (paramData.length > 0) {
         for (let bI = 0; bI < paramData.length; bI++) {
            $(".body-rating").append(`
            <div class="mt-2">
               <span style="font-weight: bold">${paramData[bI].customerName}</span>
               <span class="ratingId d-none">${paramData[bI].id}</span>
               <span class="raty-${bI} rating-raty"></span>         
               <p style="margin-bottom: 0.1rem">${paramData[bI].content}</p>
               <span class="rating-delete">Xóa</span>         
            </div>
         `);
            $(`.raty-${bI}`).raty({ path: `/images/`, score: paramData[bI].ratingNumber, readOnly: true });
         }
      } else {
         $(".body-rating").append(`<div class="text-center"><p>Chưa có đánh giá</p></div>`);
      }
   }

   //Lấy id của Row trên table
   function getDataRow(paramBtn) {
      let vTrClick = $(paramBtn).closest("tr");
      let vDataRow = vTable.row(vTrClick).data();
      gProductIdClick = vDataRow.id;
      return vDataRow;
   }

   //Thu thập thông tin trong modal Insert
   function getDataInInsertModal() {
      var formData = new FormData();

      // Thêm các trường dữ liệu vào formData
      formData.append("productLineId", $("#select-insert-productLine").val());
      formData.append("productCode", $("#inp-insert-code").val().trim());
      formData.append("productName", $("#inp-insert-name").val().trim());
      formData.append("productDescripttion", $("#text-insert-description").val().trim());
      formData.append("productVendor", $("#select-insert-vendor option:selected").text());
      
      let vOriginalQuantity = $("#inp-insert-quantityInStock").val();
      formData.append("quantityInStock", vOriginalQuantity.replace(/,/g, ""));
      
      let vOriginalPrice = $("#inp-insert-buyPrice").val();
      formData.append("buyPrice", vOriginalPrice.replace(/,/g, ""));
      
      // Duyệt qua mảng gListImgAdd và thêm từng file vào FormData
      for (var i = 0; i < gListImgAdd.length; i++) {
         formData.append('productImg', gListImgAdd[i].file);
      }
      
        
      return formData;   
   }

   //Thu thập thông tin trong modal Update
   function getDataInUpdateModal() {
      let vData = {};
      vData.productCode = $("#inp-update-code").val().trim();
      vData.productName = $("#inp-update-name").val().trim();
      vData.productDescripttion = $("#text-update-description").val().trim();
      vData.productVendor = $("#select-update-vendor option:selected").text();
      let vOriginalQuantity = $("#inp-update-quantityInStock").val();

      vData.quantityInStock = vOriginalQuantity.replace(/,/g, "");
      let vOriginalPrice = $("#inp-update-buyPrice").val();
      vData.buyPrice = vOriginalPrice.replace(/,/g, "");
      vData.productImg = [];

      $(".img-update-modal img").each(function () {
         var src = $(this).attr("src");
         vData.productImg.push(src.split("/").pop());
      });
      return vData;
   }

   var vIsDisplay = true;
   //Kiểm tra thông tin ở Inser Modal và updateModal
   function valvValidateData(paramAction) {
      if (paramAction == "insert") {
         var vCodeProduct = $("#inp-insert-code");
         var vNameProduct = $("#inp-insert-name");
         var vQuantityProduct = $("#inp-insert-quantityInStock");
         var vPriceProduct = $("#inp-insert-buyPrice");
         var vImageAdd = $("#inp-insert-file");
      } else {
         var vCodeProduct = $("#inp-update-code");
         var vNameProduct = $("#inp-update-name");
         var vQuantityProduct = $("#inp-update-quantityInStock");
         var vPriceProduct = $("#inp-update-buyPrice");
      }

      // Thêm sự kiện input cho trường mã sản phẩm
      vCodeProduct.on("input", function () {
         // Xóa thẻ <span> hiển thị lỗi
         $(this).siblings("span").remove();
         vIsDisplay = true;
      });

      if (vCodeProduct.val() == "") {
         if (vIsDisplay) {
            vCodeProduct.parent().append(`<span style="color:red" class="notice-warning">Nhập mã sản phẩm</span>`);
            vCodeProduct.focus();
            vIsDisplay = false;
         }
         return false;
      }

      // Thêm sự kiện input cho trường tên sản phẩm
      vNameProduct.on("input", function () {
         // Xóa thẻ <span> hiển thị lỗi
         $(this).siblings("span").remove();
         vIsDisplay = true;
      });

      if (vNameProduct.val() == "") {
         if (vIsDisplay) {
            vNameProduct.parent().append(`<span style="color:red" class="notice-warning">Nhập tên sản phẩm</span>`);
            vNameProduct.focus();
            vIsDisplay = false;
         }
         return false;
      }

      // Thêm sự kiện input cho trường số lượng tồn kho
      vQuantityProduct.on("input", function () {
         // Xóa thẻ <span> hiển thị lỗi
         $(this).siblings("span").remove();
         vIsDisplay = true;
      });

      if (vQuantityProduct.val() == "") {
         if (vIsDisplay) {
            vQuantityProduct.parent().append(`<span style="color:red" class="notice-warning">Nhập số lượng</span>`);
            vQuantityProduct.focus();
            vIsDisplay = false;
         }

         return false;
      }

      // Thêm sự kiện input cho trường giá sản phẩm
      vPriceProduct.on("input", function () {
         // Xóa thẻ <span> hiển thị lỗi
         $(this).siblings("span").remove();
         vIsDisplay = true;
      });

      if (vPriceProduct.val() == "") {
         if (vIsDisplay) {
            vPriceProduct.parent().append(`<span style="color:red" class="notice-warning">Nhập giá sản phẩm</span>`);
            vPriceProduct.focus();

            vIsDisplay = false;
         }

         return false;
      }

      if(gListImgAdd.length > 5){
         if (vIsDisplay) {
            vImageAdd.parent().append(`<span style="color:red" class="notice-warning warning-max-img">Tối đa  5 hình</span>`);
            vIsDisplay = false;
         }

         return false;
      }

      return true;
   }

   function handleFailCreateProduct(paramXhr, paramStatus) {
      if (paramXhr.status == 400) {
         var responseText = paramXhr.responseText;

         let vName = paramStatus == "insert" ? $("#inp-insert-name") : $("#inp-update-name");
         let vCode = paramStatus == "insert" ? $("#inp-insert-code") : $("#inp-update-code");

         if (responseText == "Mã Sp đã tồn tại") {
            if (vIsDisplay == true) {
               vCode.parent().append(`<span style="color:red" class="notice-warning">${responseText}</span>`);
               vIsDisplay = false;
            }
         } else if (responseText == "Tên sp đã tồn tại") {
            if (vIsDisplay == true) {
               vName.parent().append(`<span style="color:red" class="notice-warning">${responseText}</span>`);
               vIsDisplay = false;
            }
         }
      }
   }

   //Show thông tin hàng con trong table
   function showInfoInRowChild(paramObj) {
      var imagesHTML = paramObj.productImg
         .map((img) => `<img src="/images/${img}" alt="" style="width: 100px" />`)
         .join("");
      return `
         <table class="table" style="background-color: white">
            <tr>
               <td> Image </td> 
               <td style="display: flex; flex-wrap: wrap; justify-content: center"> ${imagesHTML}</td>
            </tr>
         </table>          
      `;
   }

   function showNotice(paramText) {
      $("#notice-modal").find("h6").text(paramText);
      $("#notice-modal").modal("show");
   }
});
