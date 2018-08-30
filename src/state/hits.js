export const hits = ({ params } = {}) => ({ uiState }) => {
  const partial = params.escapeHits
    ? {
        highlightPreTag: '__ais-highlight__',
        highlightPostTag: '__/ais-highlight__',
      }
    : undefined;

  return {
    configuration: partial,
    uiState,
  };
};
