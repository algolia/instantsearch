export function formatNumber(
  value: string,
  render: (x: string) => string = (x) => x,
  numberLocale?: string
) {
  return Number(render(value)).toLocaleString(numberLocale);
}
