export function formatNumber(
  value: string,
  render: (value: string) => string = (x) => x,
  numberLocale?: string
) {
  return Number(render(value)).toLocaleString(numberLocale);
}
