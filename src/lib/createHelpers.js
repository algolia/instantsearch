import highlight from './highlight';

export default function({ numberLocale }) {
  return {
    formatNumber(number, render) {
      return Number(render(number)).toLocaleString(numberLocale);
    },
    highlight(options, render) {
      let highlightOptions;

      try {
        highlightOptions = JSON.parse(options);
      } catch (error) {
        return render('');
      }

      return render(
        highlight({
          ...highlightOptions,
          hit: this,
        })
      );
    },
  };
}
