export default function formatNumber({ number, numberLocale }) {
  return Number(number).toLocaleString(numberLocale);
}
