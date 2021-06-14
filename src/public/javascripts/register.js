$('#sign_up').on('click', () => {
  $.ajax({
    url: "/register",
    type: 'GET',
    success: (data) => {

      $('#title').append(` - Sign up`);

      $("#content").html(data);
    }
  });
});