import panel from '../panel';

describe('panel call', () => {
  test('without arguments does not throw', () => {
    expect(() => panel()).not.toThrow();
  });

  test('with templates does not throw', () => {
    expect(() =>
      panel({
        templates: { header: 'header' },
      })
    ).not.toThrow();
  });

  test('with a `hidden` function does not throw', () => {
    expect(() =>
      panel({
        hidden: () => true,
      })
    ).not.toThrow();
  });

  test('with `hidden` as a boolean throws usage', () => {
    expect(() =>
      panel({
        hidden: true,
      })
    ).toThrow(/^\[InstantSearch.js\]/);
  });

  test('with a widget without `container` throws', () => {
    const fakeWidget = () => {};

    expect(() => panel()(fakeWidget)({})).toThrowErrorMatchingInlineSnapshot(
      `"[InstantSearch.js] The \`container\` option is required in the widget \\"fakeWidget\\"."`
    );
  });
});
