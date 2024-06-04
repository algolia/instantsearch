import poweredBy from '../powered-by';

describe('poweredBy call', () => {
  it('throws an exception when no container', () => {
    expect(poweredBy).toThrowErrorMatchingInlineSnapshot(`
"The \`container\` option is required.

See documentation: https://www.algolia.com/doc/api-reference/widgets/powered-by/js/"
`);
  });
});
