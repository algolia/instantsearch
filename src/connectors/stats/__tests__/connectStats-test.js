import jsHelper from 'algoliasearch-helper';
const SearchResults = jsHelper.SearchResults;

import connectStats from '../connectStats';

describe('connectStats', () => {
  describe('Usage', () => {
    it('throws without render function', () => {
      expect(() => {
        connectStats()({});
      }).toThrowErrorMatchingInlineSnapshot(`
"The render function is not valid (received type Undefined).

See documentation: https://www.algolia.com/doc/api-reference/widgets/stats/js/#connector"
`);
    });

    it('is a widget', () => {
      const render = jest.fn();
      const unmount = jest.fn();

      const customStats = connectStats(render, unmount);
      const widget = customStats({});

      expect(widget).toEqual(
        expect.objectContaining({
          $$type: 'ais.stats',
          init: expect.any(Function),
          render: expect.any(Function),
          dispose: expect.any(Function),
        })
      );
    });
  });

  it('Renders during init and render', () => {
    // test that the dummyRendering is called with the isFirstRendering
    // flag set accordingly
    const rendering = jest.fn();
    const makeWidget = connectStats(rendering);

    const widget = makeWidget({
      foo: 'bar', // dummy param to test `widgetParams`
    });

    const helper = jsHelper({});
    helper.search = jest.fn();

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
    });

    {
      // should call the rendering once with isFirstRendering to true
      expect(rendering).toHaveBeenCalledTimes(1);
      const isFirstRendering =
        rendering.mock.calls[rendering.mock.calls.length - 1][1];
      expect(isFirstRendering).toBe(true);

      // should provide good values for the first rendering
      const {
        hitsPerPage,
        nbHits,
        nbPages,
        page,
        processingTimeMS,
        query,
        widgetParams,
      } = rendering.mock.calls[rendering.mock.calls.length - 1][0];
      expect(hitsPerPage).toBe(helper.state.hitsPerPage);
      expect(nbHits).toBe(0);
      expect(nbPages).toBe(0);
      expect(page).toBe(0);
      expect(processingTimeMS).toBe(-1);
      expect(query).toBe('');
      expect(widgetParams).toEqual({ foo: 'bar' });
    }

    widget.render({
      results: new SearchResults(helper.state, [
        {
          hits: [{ One: 'record' }],
          nbPages: 1,
          nbHits: 1,
          hitsPerPage: helper.state.hitsPerPage,
          page: helper.state.page,
          query: '',
          processingTimeMS: 12,
        },
      ]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    {
      // Should call the rendering a second time, with isFirstRendering to false
      expect(rendering).toHaveBeenCalledTimes(2);
      const isFirstRendering =
        rendering.mock.calls[rendering.mock.calls.length - 1][1];
      expect(isFirstRendering).toBe(false);

      // should provide good values after the first search
      const {
        hitsPerPage,
        nbHits,
        nbPages,
        page,
        processingTimeMS,
        query,
      } = rendering.mock.calls[rendering.mock.calls.length - 1][0];
      expect(hitsPerPage).toBe(helper.state.hitsPerPage);
      expect(nbHits).toBe(1);
      expect(nbPages).toBe(1);
      expect(page).toBe(helper.state.page);
      expect(processingTimeMS).toBe(12);
      expect(query).toBe('');
    }
  });

  it('does not throw without the unmount function', () => {
    const rendering = () => {};
    const makeWidget = connectStats(rendering);
    const widget = makeWidget({});
    const helper = jsHelper({});
    expect(() => widget.dispose({ helper, state: helper.state })).not.toThrow();
  });
});
