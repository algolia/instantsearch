import analytics from '../analytics';

describe('Usage', () => {
  it('throws without `pushFunction`', () => {
    expect(() => {
      analytics({
        // @ts-ignore
        pushFunction: undefined,
      });
    }).toThrowErrorMatchingInlineSnapshot(`
"The \`pushFunction\` option is required.

See documentation: https://www.algolia.com/doc/api-reference/widgets/analytics/js/"
`);
  });

  it('shows deprecation warning message.', () => {
    expect(() => {
      analytics({
        pushFunction: () => {},
      });
    }).toWarnDev(
      `[InstantSearch.js]: \`analytics\` widget has been deprecated. It is still supported in 4.x releases, but not further. It is replaced by \`insights\` middleware.

For more information, visit https://www.algolia.com/doc/guides/getting-insights-and-analytics/search-analytics/click-through-and-conversions/how-to/send-click-and-conversion-events-with-instantsearch/js/`
    );
  });
});
