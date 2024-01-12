$(document).ready(function () {
   /*** REGION 1 - Global variables - Vùng khai báo biến, hằng số, tham số TOÀN CỤC */
   const gLocalhost = "http://localhost:8080";

   //Thông tin product
   var gProduct;
   var gHeader;
   var vParentComment;
   var isErrorDisplay = true;
   var isErrorDisplaySignin = true;
   var isErrorSignUp = true;
   var isErrorSignIn = true;

   //Kiểm tra quyền ADMIN HOẶC MODERATOR
   var vIsRole = false;
   /*** REGION 2 - Vùng gán / thực thi sự kiện cho các elements */
   //Kiểm tra user đã đăng nhập chưa
   checkExistTokenUser();

   onPageLoading();

   //Khi click vào nút Search
   $("#header-btnSearch").on("click", function () {
      let vValueFind = $("#header-inpSearch").val().trim();
      if (vValueFind !== "") {
         location.href = "../search/search.html?key=" + vValueFind;
      }
   });

   //sự kiện click cho phím plus tăng đơn vị  nhưng không lớn hơn quantityInStock
   $(".fa-circle-plus").on("click", function () {
      var currentVal = parseInt($("#inp-quantityItem").val());
      var vQantityInStock = parseInt($(".span-quantityInStock").text());

      if (currentVal < vQantityInStock) {
         $("#inp-quantityItem").val(currentVal + 1);
      } else {
         $("#inp-quantityItem").val(vQantityInStock);
      }
   });

   //sự kiện click phím minus giảm đơn vị  nhưng không nhỏ hơn 1
   $(".fa-circle-minus").on("click", function () {
      var currentVal = parseInt($("#inp-quantityItem").val());
      if (currentVal > 1) {
         $("#inp-quantityItem").val(currentVal - 1);
      } else {
         $("#inp-quantityItem").val(1);
      }
   });

   //sự kiện điều kiện cho quantityItem không lớn hơn quantityInStock và không nhỏ hơn 0
   $("#inp-quantityItem").on("keyup", function () {
      var currentVal = parseInt($("#inp-quantityItem").val());
      var vQantityInStock = parseInt($(".span-quantityInStock").text());
      if (currentVal <= 0) {
         $(this).val(1);
      }

      if (currentVal > vQantityInStock) {
         $(this).val(vQantityInStock);
      }
   });

   //sự kiện nút thêm giỏ hàng
   $("#btn-addProductToOrder").on("click", function () {
      //Thêm Sản Phẩm vào LocalStorage
      addProductToLocalStorage();

      //Cập nhật hình ảnh só lượng ở rổ hàng khi thực thi sự kiện click
      updateImageQuantityItemOfBag();

      //Gọi Toast
      var Toast = Swal.mixin({
         toast: true,

         showConfirmButton: false,
         timer: 1000,
         customClass: {
            title: "text-title",
            popup: "myCustomPopup",
         },
      });

      Toast.fire({
         icon: "success",
         title: "Thêm giỏ hàng thành công",
      });
   });

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

   //Khi click vào nút phản hồi trên comment
   $("#wrapper-comment").on("click", ".comment-reply", function () {
      var commentInput = $("#comment-input");
      var vInputComment = `
        <div id="comment-input" class="my-1" style="position: relative">
            <div style=" margin-left: 5%; width: 95%">
               <textarea type="text" name="" id="inp-replyComment" class="form-comment" placeholder="Ý Kiến Của Bạn"></textarea>
               <div class="d-flex flex-row-reverse">
                  <span class="btn-postReply">Gửi</span>
               </div>
          </div>
        </div>`;

      // If the comment-input already exists and belongs to this comment-reply, remove it
      if (commentInput.length && commentInput.parent()[0] === $(this).closest(".comment-parent")[0]) {
         commentInput.remove();
      } else {
         // If it does not exist, create a new comment input and remove any existing ones
         $(this).closest("#wrapper-comment").find("#comment-input").remove();
         $(this).closest(".comment-parent").append(vInputComment);
      }
   });

   //Khi click vào nút gửi trên input bình luận con
   $("#wrapper-comment").on("click", ".btn-postReply", function () {
      //Lưu thẻ <div> cha chứa phím gửi của reply vào biên global để append reply comment vào cha
      vParentComment = $(this).closest(".comment-parent");
      //thu thập thông tin content comment
      let vReplyComment = $("#inp-replyComment").val().replace(/\n/g, "<br>");
      //Lấy id comment cha
      let vParenCommentId = vParentComment.find(".ratingId").first().text();
      //Gọi Api Tạo comment con
      callApiCreateReplyComment(vReplyComment, vParenCommentId);
   });

   //Khi click vào nút xóa comment
   $("#wrapper-comment").on("click", ".comment-delete", function () {
      let vIdComment = $(this).siblings(".ratingId").text();
      let vParenComment = $(this).parent().parent();
      callApiDeleteCommentById(vIdComment, vParenComment);
   });

   //Khi click vào nút xóa rating
   $("#wrapper-comment").on("click", ".rating-delete", function () {
      let vIdComment = $(this).siblings(".ratingId").text();
      let vParenComment = $(this).parent().parent();
      callApiDeleteRatingById(vIdComment, vParenComment);
   });

   /*** REGION 3 - Event handlers - Vùng khai báo các hàm xử lý sự kiện */
   function onPageLoading() {
      // Lấy Tên Sản phẩm trên thanh URL
      let vProductName = getProductNameInUrl();

      // Gọi Api Thông tin Sản phẩm dựa trên tên Sản phẩm
      callApiProDuctByName(vProductName);

      // Gọi Api Bình luận Sản phẩm dựa trên tên Sản phẩm
      callApiReviewRatingByProductName(vProductName);

      //Lấy số lượng Product lưu trong Localstorage
      getQuantityItemInBag();
   }

   /*** REGION 4 - Common funtions - Vùng khai báo hàm dùng chung trong toàn bộ chương trình*/

   // Gọi Api Thông tin Sản phẩm dựa trên tên Sản phẩm
   function callApiProDuctByName(paramProductName) {
      $.ajax({
         url: `${gLocalhost}/productByName?name=${paramProductName}`,
         type: "GET",
         success: function (res) {
            console.log(res);
            gProduct = res;
            //Sau khi gọi thành công, load data sản phẩm vào trang product
            loadDataProductToProduct(res);
            swiper();
         },
      });
   }

   // Gọi Api đánh giá dựa trên tên Sản phẩm
   function callApiReviewRatingByProductName(paramProductName) {
      $.ajax({
         url: `${gLocalhost}/rating/ratingByproductName?productName=${paramProductName}`,
         type: "GET",
         success: function (res) {
            console.log(res);
            loadALlReviewRating(res);
         },
      });
   }

   //Gọi API thông tin chi tiết User
   function callApiDetailUser(paramHeader) {
      $.ajax({
         async: false,
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

   //Gọi API tạo user với customer theo user
   function callApiCreateUser(paramInfo) {
      $.ajax({
         type: "POST",
         url: `${gLocalhost}/signupCilent`,
         contentType: "application/json",
         data: JSON.stringify(paramInfo),
         success: function (res) {
            alert(res.message);
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
            location.reload();
         },
         error: function (xhr) {
            if (isErrorSignIn) {
               $("#inp-signIn-password").parent().append(`<p style="color:red">${xhr.responseText}</p>`);
               isErrorSignIn = false;
            }
         },
      });
   }

   //Gọi API tạo comment  trên DB
   function callApiCreateReplyComment(paramReplyContent, paramParenCommentId) {
      let vContent = {
         content: paramReplyContent,
      };

      let vUsername = JSON.parse(localStorage.getItem("userSigninShop24h")).username;

      $.ajax({
         type: "POST",
         url: `${gLocalhost}/comment/createComment/rating/${paramParenCommentId}/customer/${vUsername}`,
         contentType: "application/json",
         data: JSON.stringify(vContent),
         success: function (res) {
            console.log(res);
            $("#comment-input").remove();
            loadReplyComment(res);
         },
         error: function (xhr) {
            alert(xhr.responseText);
         },
      });
   }

   //Gọi API xóa comment
   function callApiDeleteCommentById(paramId, paramParent) {
      $.ajax({
         headers: gHeader,
         type: "DELETE",
         url: `${gLocalhost}/comment/deleteComment/comment/${paramId}`,
         success: function (res) {
            removeCommen(paramParent);
         },
         error: function (xhr) {
            alert(xhr.responseText);
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
            removeCommen(paramParent);
         },
         error: function (xhr) {
            alert(xhr.responseText);
         },
      });
   }

   // Load data sản phẩm vào trang product
   function loadDataProductToProduct(paramDataProduct) {
      $("#star-rating").raty({ path: `${gLocalhost}/product-photos/`, score: paramDataProduct.averageRating, readOnly: true });
      $("#score-product").html(paramDataProduct.averageRating.toFixed(1));
      $("#main-detail h4").text(paramDataProduct.productName);
      $("#main-detail h3").text(paramDataProduct.buyPrice.toLocaleString() + " đ");
      $(".span-quantityInStock").text(paramDataProduct.quantityInStock);

      let vParamImg = paramDataProduct.productImg;
      for (let bI = 0; bI < vParamImg.length; bI++) {
         $("#mainSwiper").append(
            `<div class="swiper-slide">
                   <img
                       src="${gLocalhost}/product-photos/${vParamImg[bI]}"
                   />
               </div>`
         );
         $("#thumbSwiper").append(
            `<div class="swiper-slide">
            <img
                src="${gLocalhost}/product-photos/${vParamImg[bI]}"
            />
        </div>`
         );
      }
   }

   //Load All comment khi tải trang
   function loadALlReviewRating(paramRating) {
      let vDeleteRating = vIsRole ? '&nbsp<span class="rating-delete">Xóa</span>' : "";
      let vDeleteComment = vIsRole ? '&nbsp<span class="comment-delete">Xóa</span>' : "";
      let wrapperComment = $("#wrapper-comment");
      for (let i = 0; i < paramRating.length; i++) {
         let vRatingIndex = paramRating[i];
         wrapperComment.append(`
          <div class="my-3 comment-parent">
            <div>
              <span style="font-weight: bold">${vRatingIndex.customerName}</span>
              <span class="ratingId d-none">${vRatingIndex.id}</span>
              <div>
                  <span class="raty-${i} rating-raty"></span>
               </div>
               <p style="margin-bottom: 0.1rem">${vRatingIndex.content}</p>
              <span class="comment-reply">Phản hồi</span>
              ${vDeleteRating}
            </div>
          </div>
        `);

         $(`.raty-${i}`).raty({ path: `${gLocalhost}/product-photos/`, score: vRatingIndex.ratingNumber, readOnly: true });

         if (vRatingIndex.comments.length != 0) {
            for (let bU = 0; bU < vRatingIndex.comments.length; bU++) {
               let vCommentIndex = vRatingIndex.comments[bU];
               let vUserNameRole = vCommentIndex.roleCustomer[0].name;
               let vRole = vUserNameRole == "ROLE_ADMIN" || vUserNameRole == "ROLE_MODERATOR" ? "- Quản Trị Viên" : "";
               let vCssRole =
                  vUserNameRole == "ROLE_ADMIN" || vUserNameRole == "ROLE_MODERATOR" ? "color: #009981" : "";

               let vReplyComment = `
               <div  class=" reply-comment mt-2" style="position: relative">
                  <div style=" margin-left: 5%; width: 95%">
                     <span style="font-weight: bold; ${vCssRole}">${vCommentIndex.customerName} ${vRole}</span>
                     <span class="ratingId d-none">${vCommentIndex.id}</span>
                     <p style="margin-bottom: 0.1rem">${vCommentIndex.content}</p>
                     ${vDeleteComment}
                  </div>
               </div>`;
               // append reply comment to the parent comment
               wrapperComment.children(".comment-parent").eq(i).append(vReplyComment);
            }
         }
      }
   }

   //Load comment reply vào hộp thoại comment
   function loadReplyComment(paramReplyComment) {
      let vDeleteComment = vIsRole ? '&nbsp<span class="comment-delete">Xóa</span>' : "";
      let vUsernameRole = vIsRole ? "- Quản Trị Viên" : "";
      let vCssRole = vIsRole ? "color: #009981" : "";

      var vReplyComment = `
        <div  class=" reply-comment mt-2" style="position: relative">
            <div style=" margin-left: 5%; width: 95%">
               <span style="font-weight: bold; ${vCssRole}">${paramReplyComment.customerName} ${vUsernameRole}</span>
               <span class="ratingId d-none">${paramReplyComment.id}</span>
               <p style="margin-bottom: 0.1rem">${paramReplyComment.content}</p>
               ${vDeleteComment}
            </div>
        </div>`;

      vParentComment.append(vReplyComment);
   }

   //Xóa comment
   function removeCommen(paramComment) {
      $(paramComment).remove();
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

   //Lấy Thông tin từ modal Đăng Nhập
   function getInfoInSignInModal() {
      vInfo = {};
      vInfo.username = $("#inp-signIn-phoneNumber").val();
      vInfo.password = $("#inp-signIn-password").val();
      return vInfo;
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

   //Lưu user vào localstorage
   function setLocalStorageUser(paramData) {
      $("#signIn-modal").modal("hide");
      localStorage.setItem("userSigninShop24h", JSON.stringify(paramData));
      location.reload();
   }

   //Lấy Tên Sản phẩm trên thanh URL
   function getProductNameInUrl() {
      let vUrlString = window.location.href;
      let vUrl = new URL(vUrlString);
      let vProductName = vUrl.searchParams.get("name");
      return vProductName;
   }

   //Lấy số lượng Product lưu trong Localstorage
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

   //Script của thư viện Swiper
   function swiper() {
      var swiper = new Swiper(".mySwiper", {
         loop: true,
         spaceBetween: 10,
         slidesPerView: 4,
         freeMode: true,
         watchSlidesProgress: true,
         watchSlidesVisibility: true,
      });
      var swiper2 = new Swiper(".mySwiper2", {
         loop: true,
         spaceBetween: 10,
         navigation: {
            nextEl: ".swiper-button-next ",
            prevEl: ".swiper-button-prev ",
         },
         thumbs: {
            swiper: swiper,
         },
      });
      document.querySelector(".mySwiper-button-next").addEventListener("click", function () {
         swiper2.slideNext();
      });

      document.querySelector(".mySwiper-button-prev").addEventListener("click", function () {
         swiper2.slidePrev();
      });
   }

   //Thêm Sản Phẩm vào LocalStorage
   function addProductToLocalStorage() {
      var vProductInBag = JSON.parse(localStorage.getItem("bagProduct_HH") || "[]");
      var vProductToAdd = { gProduct, quantityItem: Number($("#inp-quantityItem").val()) };

      var foundProduct = vProductInBag.find(
         (product) => product.gProduct.productName === vProductToAdd.gProduct.productName
      );
      if (foundProduct) {
         foundProduct.quantityItem += Number(vProductToAdd.quantityItem);
      } else {
         vProductInBag.push(vProductToAdd);
      }
      localStorage.setItem("bagProduct_HH", JSON.stringify(vProductInBag));
   }

   //Update hình ảnh số lượng order ở giỏ hàng
   function updateImageQuantityItemOfBag() {
      var vProductInBag = JSON.parse(localStorage.getItem("bagProduct_HH"));
      var vTotalQuantityItemInBag = 0;
      for (let product of vProductInBag) {
         vTotalQuantityItemInBag += product.quantityItem;
      }
      $("#span-quantityItem").text(vTotalQuantityItemInBag);
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
         vIsRole = true;
      }
   }
});
