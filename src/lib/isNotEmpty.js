exports.isNotEmpty = (arg) => {

  // console.log(arg);
  // console.log(typeof arg !== 'undefined');
  // console.log(typeof arg !== null);
  // console.log(typeof arg !== '' )

  // console.log(typeof arg !== 'undefined' && arg !== null && arg !== "");

  let value;

  if(typeof arg !== 'undefined' && arg !== null && arg !== "")
    value = true;
  else
    value = false;

  // console.log(arg, value);
  return value;
}