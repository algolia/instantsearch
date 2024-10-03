import { renderTemplate } from '../renderTemplate';

describe('renderTemplate', () => {
  it('expect to process templates as function', () => {
    const templateKey = 'test';
    const data = { type: 'functions' };
    const templates = {
      test: (d: typeof data) => `it works with ${d.type}`,
    };

    const actual = renderTemplate({
      templateKey,
      templates,
      data,
    });

    const expectation = 'it works with functions';

    expect(actual).toBe(expectation);
  });

  it('expect to throw when the template is not a function', () => {
    const actual0 = () =>
      renderTemplate({
        templateKey: 'test',
        templates: {},
      });

    const actual1 = () =>
      renderTemplate({
        templateKey: 'test',
        // @ts-expect-error wrong usage
        templates: { test: null },
      });

    const actual2 = () =>
      renderTemplate({
        templateKey: 'test',
        // @ts-expect-error wrong usage
        templates: { test: 10 },
      });

    const actual3 = () =>
      renderTemplate({
        templateKey: 'test',
        // @ts-expect-error wrong usage
        templates: { test: 'test' },
      });

    const expectation0 = `Template must be 'function', was 'undefined' (key: test)`;
    const expectation1 = `Template must be 'function', was 'object' (key: test)`;
    const expectation2 = `Template must be 'function', was 'number' (key: test)`;
    const expectation3 = `Template must be 'function', was 'string' (key: test)`;

    expect(() => actual0()).toThrow(expectation0);
    expect(() => actual1()).toThrow(expectation1);
    expect(() => actual2()).toThrow(expectation2);
    expect(() => actual3()).toThrow(expectation3);
  });
});
