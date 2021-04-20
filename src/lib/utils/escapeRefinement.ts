function escapeRefinement(value: number): string | number;
function escapeRefinement(value: string): string;
function escapeRefinement(value: string | number): string | number {
  if (typeof value === 'number' && value < 0) {
    value = String(value).replace(/^-/, '\\-');
  }

  return value;
}

export default escapeRefinement;
