$().ready(function () {
  
  const gnc_month = calculateMonthsDiff("2022-08-18", "재직중");
  document.querySelectorAll(".gnc-month").forEach(element => {
      element.innerHTML = gnc_month
  });

  $("#my-career").click(function(){
    Swal.fire({
      template:"#my-career-modal",
      width: 1000,
      confirmButtonColor: "rgb(60, 179, 113)",
      confirmButtonText : "Close"
    })
  })

  $("#enjo-eat").click(function(){
    Swal.fire({
      template:"#enjo-eat-modal",
      width: 1000,
      confirmButtonColor: "rgb(60, 179, 113)",
      confirmButtonText : "Close"
    })
  })

  $("#emax").click(function(){
    Swal.fire({
      template:"#emax-modal",
      width: 1000,
      confirmButtonColor: "rgb(60, 179, 113)",
      confirmButtonText : "Close"
    })
  })
  
  $("#build-performance").click(function(){
    Swal.fire({
      template:"#build-performance-modal",
      width: 1000,
      confirmButtonColor: "rgb(60, 179, 113)",
      confirmButtonText : "Close"
    })
  })

  $("#envisager").click(function(){
    Swal.fire({
      template:"#envisager-modal",
      width: 1000,
      confirmButtonColor: "rgb(60, 179, 113)",
      confirmButtonText : "Close"
    })
  })

  $("#buildpay").click(function(){
    Swal.fire({
      template:"#buildpay-modal",
      width: 1000,
      confirmButtonColor: "rgb(60, 179, 113)",
      confirmButtonText : "Close"
    })
  })

});


function calculateMonthsDiff(start_str, end_str){
  let start_date = new Date(start_str);
  let end_date = end_str == "재직중" ? new Date() : new  Date(end_str);
  let yearsDifference = end_date.getFullYear() - start_date.getFullYear();
  let monthsDifference = end_date.getMonth() - start_date.getMonth();

  if (monthsDifference < 0) {
      yearsDifference--;
      monthsDifference += 12;
  }

  const totalMonths = yearsDifference * 12 + monthsDifference;

  if(yearsDifference <= 0 ){
    return `약 ${monthsDifference} 개월`
  }else{
    return `약 ${yearsDifference} 년 ${monthsDifference} 개월`
  }
}