$().ready(function () {
  $("#enjo-eat").click(function(){
    Swal.fire({
      template:"#enjo-eat-modal",
      width: 1300,
      confirmButtonColor: "rgb(60, 179, 113)",
      confirmButtonText : "Close"
    })
  })

  $("#buildpay").click(function(){
    Swal.fire({
      template:"#buildpay-modal",
      width: 1300,
      confirmButtonColor: "rgb(60, 179, 113)",
      confirmButtonText : "Close"
    })
  })
});