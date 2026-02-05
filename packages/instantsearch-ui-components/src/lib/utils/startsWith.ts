export function startsWith(str: string, prefix: string): boolean {
  return str.slice(0, prefix.length) === prefix;
}
