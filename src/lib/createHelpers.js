export default function({numberLocale}) {
  return {
    formatNumber(number, render) {
      return Number(render(number)).toLocaleString(numberLocale);
    }
  };
}
