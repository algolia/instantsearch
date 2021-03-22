import analytics from '../analytics';

describe('Usage', () => {
  it('throws without `pushFunction`', () => {
    expect(() => {
      analytics({
        // @ts-expect-error
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
      `[InstantSearch.js]: \`analytics\` widget has been deprecated. It is still supported in 4.x releases, but not further. It is replaced by the \`insights\` middleware.

For the migration, visit https://www.algolia.com/doc/guides/building-search-ui/upgrade-guides/js/#analytics-widget`
    );
  });
});
