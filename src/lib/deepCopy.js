deepCopy = (obj) => {
  if (Array.isArray(obj)) return new Array();

  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  let copy = [];
  for (let key in obj) {
    copy[key] = deepCopy(obj[key]);
  }
  return copy;
}

module.exports = deepCopy;