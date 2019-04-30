function unescapeRefinement(value: string | number): string {
  return String(value).replace(/^\\-/, '-');
}

export default unescapeRefinement;
