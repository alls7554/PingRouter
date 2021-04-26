startDisabled = () => {
  $('#start').attr('disabled', true);
  $('#Hours').attr('disabled', true);
  $('#Minutes').attr('disabled', true);
  $('#Seconds').attr('disabled', true);
  $('#timeSet').attr('disabled', true);
  $('#timeReset').attr('disabled', true);
}

resetDisabled = () => {
  $('#start').attr('disabled', false);
  $('#reset').attr('disabled', true);
  $('#save').attr('disabled', true);
  $('#Hours').attr('disabled', false);
  $('#Minutes').attr('disabled', false);
  $('#Seconds').attr('disabled', false);
  $('#timeSet').attr('disabled', false);
}

stopDisabled = () => {
  $('#reset').attr('disabled', false);
  $('#save').attr('disabled', false);
}

trDisabled = () => {
  $('#stop').attr('disabled', true);
  $('#reset').attr('disabled', false);
  $('#save').attr('disabled', false);
}

timeSetDisabled = () => {
  $('#Hours').attr('disabled', true);
  $('#Minutes').attr('disabled', true);
  $('#Seconds').attr('disabled', true);
  $('#timeSet').attr('disabled', true);
  $('#timeReset').attr('disabled', false);
}

timeResetDisabled = () => {
  $('#Hours').attr('disabled', false);
  $('#Minutes').attr('disabled', false);
  $('#Seconds').attr('disabled', false);
  $('#timeSet').attr('disabled', false);
  $('#timeReset').attr('disabled', true);
}