$('#sign_up').on('click', () => {
  $.ajax({
    url: "/register",
    type: 'GET',
    success: (data) => {

      $('#sub_title').text(` - Sign up`);

      $("#content").html(data);
    }
  });
});