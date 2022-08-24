export function cx(cssClasses?: string | string[]) {
  return Array.isArray(cssClasses) ? cssClasses.join(' ') : cssClasses;
}
