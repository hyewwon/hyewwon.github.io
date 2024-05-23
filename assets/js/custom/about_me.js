$().ready(function () {
  $("#enjo-eat").click(function(){
    var temp = document.createElement("p")
    temp.innerHTML = "hi"
    Swal.fire({
      template:"#enjo-eat-modal"
  
    })
  })
});


