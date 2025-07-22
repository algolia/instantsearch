// @MAJOR can be replaced by native Array#findIndex when we change support
function findIndex(array, comparator) {
  if (!Array.isArray(array)) {
    return -1;
  }

  for (var i = 0; i < array.length; i++) {
    if (comparator(array[i])) {
      return i;
    }
  }
  return -1;
}

export default findIndex;
