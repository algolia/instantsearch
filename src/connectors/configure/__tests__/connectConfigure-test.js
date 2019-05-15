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

  it('should apply searchParameters', () => {
    const makeWidget = connectConfigure();
    const widget = makeWidget({ searchParameters: { analytics: true } });

    const config = widget.getConfiguration(SearchParameters.make({}));
    expect(config).toEqual({ analytics: true });
  });

  it('should apply searchParameters with a higher priority', () => {
    const makeWidget = connectConfigure();
    const widget = makeWidget({ searchParameters: { analytics: true } });

    {
      const config = widget.getConfiguration(
        SearchParameters.make({ analytics: false })
      );
      expect(config).toEqual({ analytics: true });
    }

    {
      const config = widget.getConfiguration(
        SearchParameters.make({ analytics: false, extra: true })
      );
      expect(config).toEqual({ analytics: true });
    }
  });

  it('should apply new searchParameters on refine()', () => {
    const renderFn = jest.fn();
    const makeWidget = connectConfigure(renderFn, jest.fn());
    const widget = makeWidget({ searchParameters: { analytics: true } });

    helper.setState(widget.getConfiguration());
    widget.init({ helper });

    expect(widget.getConfiguration()).toEqual({ analytics: true });
    expect(helper.state.analytics).toEqual(true);

    const { refine } = renderFn.mock.calls[0][0];
    expect(refine).toBe(widget._refine);

    refine({ hitsPerPage: 3 });

    expect(widget.getConfiguration()).toEqual({ hitsPerPage: 3 });
    expect(helper.state.analytics).toBe(undefined);
    expect(helper.state.hitsPerPage).toBe(3);
  });

  it('should dispose all the state set by configure', () => {
    const makeWidget = connectConfigure();
    const widget = makeWidget({ searchParameters: { analytics: true } });

    helper.setState(widget.getConfiguration());
    widget.init({ helper });

    expect(widget.getConfiguration()).toEqual({ analytics: true });
    expect(helper.state.analytics).toBe(true);

    const nextState = widget.dispose({ state: helper.state });

    expect(nextState.analytics).toBe(undefined);
  });
});
