

exports.getSessionId = (socket) => {
  let tmp_id = socket.handshake.headers.cookie,
  tmp = tmp_id.split('='),
  session_id = tmp[1];

  return session_id
}