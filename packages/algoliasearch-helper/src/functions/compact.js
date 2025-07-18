function compact(array) {
  if (!Array.isArray(array)) {
    return [];
  }

  return array.filter(Boolean);
}

export default compact;
