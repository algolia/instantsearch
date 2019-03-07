function escapeRefinement(value) {
  if (typeof value === 'number' && value < 0) {
    value = String(value).replace(/^-/, '\\-');
  }

  return value;
}

export default escapeRefinement;
