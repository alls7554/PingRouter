$('#sign_in').on('click', () => {
  let user_id = $('#floatingInput').val();
  let user_pwd = $('#floatingPassword').val();
  let data = { user_id, user_pwd };

  $.ajax({
    url: "/login",
    type: 'POST',
    data: data,
    statusCode: {
      403 : () => {
        alert('Check Your ID or password');
        $('#floatingPassword').val('');
      }
    },
    success: () => {
      location.href = '/main';
    }
  });
});