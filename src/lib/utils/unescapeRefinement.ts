function unescapeRefinement(value: string | number) {
  return String(value).replace(/^\\-/, '-');
}

export default unescapeRefinement;
