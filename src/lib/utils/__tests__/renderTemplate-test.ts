import renderTemplate from '../renderTemplate';

describe('renderTemplate', () => {
  it('expect to process templates as string', () => {
    const templateKey = 'test';
    const templates = { test: 'it works with {{type}}' };
    const data = { type: 'strings' };

    const actual = renderTemplate({
      templateKey,
      templates,
      data,
    });

    const expectation = 'it works with strings';

    expect(actual).toBe(expectation);
  });

  it('expect to process templates as function', () => {
    const templateKey = 'test';
    const templates = { test: data => `it works with ${data.type}` };
    const data = { type: 'functions' };

    const actual = renderTemplate({
      templateKey,
      templates,
      data,
    });

    const expectation = 'it works with functions';

    expect(actual).toBe(expectation);
  });

  it('expect to use custom compiler options', () => {
    const templateKey = 'test';
    const templates = { test: 'it works with <%options%>' };
    const data = { options: 'custom delimiter' };
    const compileOptions = { delimiters: '<% %>' };

    const actual = renderTemplate({
      templateKey,
      templates,
      data,
      compileOptions,
    });

    const expectation = 'it works with custom delimiter';

    expect(actual).toBe(expectation);
  });

  it('expect to compress templates', () => {
    expect(
      renderTemplate({
        templateKey: 'message',
        templates: {
          message: ` <h1> hello</h1>
        <p>message</p> `,
        },
      })
    ).toMatchInlineSnapshot(`"<h1> hello</h1> <p>message</p>"`);
  });

  it('expect to throw when the template is not a function or a string', () => {
    const actual0 = () =>
      renderTemplate({
        templateKey: 'test',
        templates: {},
      });

    const actual1 = () =>
      renderTemplate({
        templateKey: 'test',
        templates: { test: null },
      });

    const actual2 = () =>
      renderTemplate({
        templateKey: 'test',
        templates: { test: 10 },
      });

    const expectation0 = `Template must be 'string' or 'function', was 'undefined' (key: test)`;
    const expectation1 = `Template must be 'string' or 'function', was 'object' (key: test)`;
    const expectation2 = `Template must be 'string' or 'function', was 'number' (key: test)`;

    expect(() => actual0()).toThrow(expectation0);
    expect(() => actual1()).toThrow(expectation1);
    expect(() => actual2()).toThrow(expectation2);
  });

  describe('with helpers', () => {
    it('expect to call the relevant function', () => {
      const templateKey = 'test';
      const templates = {
        test: '{{#helpers.emphasis}}{{feature}}{{/helpers.emphasis}}',
      };

      const data = {
        feature: 'helpers',
      };

      const helpers = {
        emphasis: (text, render) => `<em>${render(text)}</em>`,
      };

      const actual = renderTemplate({
        templateKey,
        templates,
        data,
        helpers,
      });

      const expectation = '<em>helpers</em>';

      expect(actual).toBe(expectation);
    });

    // eslint-disable-next-line jest/no-done-callback
    it('expect to set the context (`this`) to the template `data`', done => {
      const templateKey = 'test';
      const templates = {
        test: '{{#helpers.emphasis}}{{feature}}{{/helpers.emphasis}}',
      };

      const data = {
        feature: 'helpers',
      };

      const helpers = {
        emphasis() {
          // context will be different when using arrow function (lexical scope used)
          expect(this).toBe(data);
          done();
        },
      };

      const actual = renderTemplate({
        templateKey,
        templates,
        data,
        helpers,
      });

      const expectation = '';

      expect(actual).toBe(expectation);
    });
  });
});
