export function normalizeArgv(argv: string[]): string[] {
  const copy = argv.slice();
  if (copy[2] === 'add' && copy[3] === 'experience') {
    copy.splice(2, 2, 'add-experience');
  } else if (copy[2] === 'add' && copy[3] === 'widget') {
    copy.splice(2, 2, 'add-widget');
  }
  return copy;
}
