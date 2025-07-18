// @MAJOR: remove this function and use Array.prototype.flat
function flat(arr) {
  return arr.reduce(function (acc, val) {
    return acc.concat(val);
  }, []);
}

export default flat;
