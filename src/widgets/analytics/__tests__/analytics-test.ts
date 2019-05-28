import analytics from '../analytics';

describe('Usage', () => {
  it('throws without `pushFunction`', () => {
    expect(() => {
      analytics({
        pushFunction: undefined,
      });
    }).toThrowErrorMatchingInlineSnapshot(`
"The \`pushFunction\` option is required.

See documentation: https://www.algolia.com/doc/api-reference/widgets/analytics/js/"
`);
  });
});
