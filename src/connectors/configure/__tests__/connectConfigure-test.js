import algoliasearchHelper, { SearchParameters } from 'algoliasearch-helper';

import connectConfigure from '../connectConfigure';

const fakeClient = {
  search: jest.fn(() => Promise.resolve({ results: [{}] })),
};

describe('connectConfigure', () => {
  let helper;

  beforeEach(() => {
    helper = algoliasearchHelper(fakeClient, '', {});
  });

  describe('Usage', () => {
    it('throws without searchParameters', () => {
      expect(() => connectConfigure()()).toThrowErrorMatchingInlineSnapshot(`
"The \`searchParameters\` option expects an object.

See documentation: https://www.algolia.com/doc/api-reference/widgets/configure/js/#connector"
`);
    });

    it('throws when you pass it a non-plain object', () => {
      expect(() => {
        connectConfigure()(new Date());
      }).toThrowErrorMatchingInlineSnapshot(`
"The \`searchParameters\` option expects an object.

See documentation: https://www.algolia.com/doc/api-reference/widgets/configure/js/#connector"
`);

      expect(() => {
        connectConfigure()(() => {});
      }).toThrowErrorMatchingInlineSnapshot(`
"The \`searchParameters\` option expects an object.

See documentation: https://www.algolia.com/doc/api-reference/widgets/configure/js/#connector"
`);
    });

    it('does not throw with a render function but without an unmount function', () => {
      expect(() => connectConfigure(jest.fn(), undefined)).not.toThrow();
    });

    it('with a unmount function but no render function does not throw', () => {
      expect(() => connectConfigure(undefined, jest.fn())).not.toThrow();
    });

    it('does not throw without render and unmount functions', () => {
      expect(() => connectConfigure(undefined, undefined)).not.toThrow();
    });
  });

  it('is a widget', () => {
    const render = jest.fn();
    const unmount = jest.fn();

    const customConfigure = connectConfigure(render, unmount);
    const widget = customConfigure({ searchParameters: {} });

    expect(widget).toEqual(
      expect.objectContaining({
        $$type: 'ais.configure',
        init: expect.any(Function),
        render: expect.any(Function),
        dispose: expect.any(Function),
        getConfiguration: expect.any(Function),
      })
    );
  });

  it('should apply searchParameters', () => {
    const makeWidget = connectConfigure();
    const widget = makeWidget({
      searchParameters: {
        analytics: true,
      },
    });

    expect(widget.getConfiguration(new SearchParameters({}))).toEqual(
      new SearchParameters({
        analytics: true,
      })
    );
  });

  it('should apply searchParameters with a higher priority', () => {
    const makeWidget = connectConfigure();
    const widget = makeWidget({
      searchParameters: {
        analytics: true,
      },
    });

    expect(
      widget.getConfiguration(
        new SearchParameters({
          analytics: false,
        })
      )
    ).toEqual(
      new SearchParameters({
        analytics: true,
      })
    );

    expect(
      widget.getConfiguration(
        new SearchParameters({
          analytics: false,
          clickAnalytics: true,
        })
      )
    ).toEqual(
      new SearchParameters({
        analytics: true,
        clickAnalytics: true,
      })
    );
  });

  it('should apply new searchParameters on refine()', () => {
    const renderFn = jest.fn();
    const makeWidget = connectConfigure(renderFn, jest.fn());
    const widget = makeWidget({
      searchParameters: {
        analytics: true,
      },
    });

    helper.setState(
      widget.getConfiguration(
        new SearchParameters({
          // This facet is added outside of the widget params
          // so it shouldn't be overridden when calling `refine`.
          facets: ['brand'],
        })
      )
    );
    widget.init({ helper });

    expect(widget.getConfiguration(new SearchParameters({}))).toEqual(
      new SearchParameters({
        analytics: true,
      })
    );
    expect(helper.state).toEqual(
      new SearchParameters({
        analytics: true,
        facets: ['brand'],
      })
    );

    const { refine } = renderFn.mock.calls[0][0];

    refine({ hitsPerPage: 3, facets: ['rating'] });

    expect(widget.getConfiguration(new SearchParameters({}))).toEqual(
      new SearchParameters({
        hitsPerPage: 3,
        facets: ['rating'],
      })
    );
    expect(helper.state).toEqual(
      new SearchParameters({
        hitsPerPage: 3,
        facets: ['brand', 'rating'],
      })
    );
  });

  it('should dispose all the state set by configure', () => {
    const makeWidget = connectConfigure();
    const widget = makeWidget({
      searchParameters: {
        analytics: true,
      },
    });

    helper.setState(widget.getConfiguration(new SearchParameters({})));
    widget.init({ helper });

    expect(widget.getConfiguration(new SearchParameters({}))).toEqual(
      new SearchParameters({
        analytics: true,
      })
    );
    expect(helper.state).toEqual(
      new SearchParameters({
        analytics: true,
      })
    );

    const nextState = widget.dispose({ state: helper.state });

    expect(nextState).toEqual(new SearchParameters({}));
  });
});
