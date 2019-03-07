function unescapeRefinement(value: any) {
  return String(value).replace(/^\\-/, '-');
}

export default unescapeRefinement;
