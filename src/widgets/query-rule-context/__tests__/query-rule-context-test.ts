import queryRuleContext from '../query-rule-context';

describe('queryRuleContext', () => {
  describe('Usage', () => {
    test('throws trackedFilters error without options', () => {
      expect(() => {
        // @ts-expect-error
        queryRuleContext();
      }).toThrowErrorMatchingInlineSnapshot(`
"The \`trackedFilters\` option is required.

See documentation: https://www.algolia.com/doc/api-reference/widgets/query-rule-context/js/"
`);
    });

    test('throws trackedFilters error with empty options', () => {
      expect(() => {
        // @ts-expect-error
        queryRuleContext({});
      }).toThrowErrorMatchingInlineSnapshot(`
"The \`trackedFilters\` option is required.

See documentation: https://www.algolia.com/doc/api-reference/widgets/query-rule-context/js/"
`);
    });

    it('is a widget', () => {
      const widget = queryRuleContext({ trackedFilters: {} });

      expect(widget).toEqual(
        expect.objectContaining({
          $$type: 'ais.queryRules',
          $$widgetType: 'ais.queryRuleContext',
        })
      );
    });
  });
});
