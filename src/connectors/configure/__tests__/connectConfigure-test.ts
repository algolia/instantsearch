import algoliasearchHelper, {
  SearchParameters,
  AlgoliaSearchHelper,
} from 'algoliasearch-helper';

import { createSearchClient } from '../../../../test/mock/createSearchClient';
import connectConfigure from '../connectConfigure';
import {
  createInitOptions,
  createDisposeOptions,
} from '../../../../test/mock/createWidget';

describe('connectConfigure', () => {
  let helper: AlgoliaSearchHelper;

  beforeEach(() => {
    helper = algoliasearchHelper(createSearchClient(), '', {});
  });

  describe('Usage', () => {
    it('throws without searchParameters', () => {
      // @ts-ignore wrong options
      expect(() => connectConfigure()()).toThrowErrorMatchingInlineSnapshot(`
"The \`searchParameters\` option expects an object.

See documentation: https://www.algolia.com/doc/api-reference/widgets/configure/js/#connector"
`);
    });

    it('throws when you pass it a non-plain object', () => {
      expect(() => {
        // @ts-ignore wrong options
        connectConfigure()(new Date());
      }).toThrowErrorMatchingInlineSnapshot(`
"The \`searchParameters\` option expects an object.

See documentation: https://www.algolia.com/doc/api-reference/widgets/configure/js/#connector"
`);

      expect(() => {
        // @ts-ignore wrong options
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
      // @ts-ignore wrong options
      expect(() => connectConfigure(undefined, jest.fn())).not.toThrow();
    });

    it('does not throw without render and unmount functions', () => {
      // @ts-ignore wrong options
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

    expect(widget.getConfiguration!(new SearchParameters({}))).toEqual(
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
      widget.getConfiguration!(
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
      widget.getConfiguration!(
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
      widget.getConfiguration!(
        new SearchParameters({
          // This facet is added outside of the widget params
          // so it shouldn't be overridden when calling `refine`.
          facets: ['brand'],
        })
      )
    );
    widget.init!(createInitOptions({ helper }));

    expect(widget.getConfiguration!(new SearchParameters({}))).toEqual(
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

    expect(widget.getConfiguration!(new SearchParameters({}))).toEqual(
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

  it('should dispose only the state set by configure', () => {
    const makeWidget = connectConfigure();
    const widget = makeWidget({
      searchParameters: {
        analytics: true,
      },
    });

    helper.setState(
      widget.getConfiguration!(
        new SearchParameters({
          clickAnalytics: true,
        })
      )
    );
    widget.init!(createInitOptions({ helper }));

    expect(widget.getConfiguration!(new SearchParameters({}))).toEqual(
      new SearchParameters({
        analytics: true,
      })
    );
    expect(helper.state).toEqual(
      new SearchParameters({
        analytics: true,
        clickAnalytics: true,
      })
    );

    const nextState = widget.dispose!(
      createDisposeOptions({ state: helper.state })
    );

    expect(nextState).toEqual(
      new SearchParameters({
        clickAnalytics: true,
      })
    );
  });
});
