$('#logout').click(()=>{
  $.ajax({
    url: "/logout",
    type: 'GET',
    success: () => {
      location.href = '/';
    }
  });
});