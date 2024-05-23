$().ready(function () {
  $("#alertStart").click(function () {
      Swal.fire({           // Alert 타입
          title: 'Alert가 실행되었습니다.',         // Alert 제목
          text: '이곳은 내용이 나타나는 곳입니다.',  // Alert 내용
          showConfirmButton : false       
      });
  });
});
