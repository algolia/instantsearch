export function cx(cssClasses?: string | string[] | undefined) {
  return Array.isArray(cssClasses)
    ? cssClasses.filter(Boolean).join(' ')
    : cssClasses || '';
}
