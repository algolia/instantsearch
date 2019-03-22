import algoliasearchHelper, { SearchResults } from 'algoliasearch-helper';
import connectQueryRules, {
  QueryRulesWidgetFactory,
} from '../connectQueryRules';

describe('connectQueryRules', () => {
  let renderFn = jest.fn();
  let unmountFn = jest.fn();
  let makeWidget: QueryRulesWidgetFactory<{}>;

  const createFakeHelper = (state = {}) => {
    const client = {};
    const indexName = '';
    const helper = algoliasearchHelper(client, indexName, state);

    helper.search = jest.fn();

    return helper;
  };

  beforeEach(() => {
    renderFn = jest.fn();
    unmountFn = jest.fn();
    makeWidget = connectQueryRules(renderFn, unmountFn);
  });

  describe('usage', () => {
    test('throws without render function', () => {
      expect(() => {
        // @ts-ignore
        connectQueryRules()({});
      }).toThrowErrorMatchingInlineSnapshot(`
"The render function is not valid (got type \\"undefined\\").

See documentation: https://www.algolia.com/doc/api-reference/widgets/query-rules/js/#connector"
`);
    });

    test('does not throw without unmount function', () => {
      expect(() => {
        connectQueryRules(() => {})({});
      }).not.toThrow();
    });
  });

  describe('lifecycle', () => {
    test('calls the render function on init', () => {
      const helper = createFakeHelper();
      const widget = makeWidget({});

      widget.init({ helper, state: helper.state, instantSearchInstance: {} });

      const [renderingParameters, isFirstRender] = renderFn.mock.calls[0];

      expect(isFirstRender).toBe(true);

      const {
        userData,
        instantSearchInstance,
        widgetParams,
      } = renderingParameters;

      expect(userData).toEqual([]);
      expect(instantSearchInstance).toEqual({});
      expect(widgetParams).toEqual({});
    });

    test('calls the render function on render', () => {
      const helper = createFakeHelper();
      const widget = makeWidget({});

      widget.init({ helper, state: helper.state, instantSearchInstance: {} });
      widget.render({
        helper,
        results: new SearchResults(helper.getState(), [{ hits: [] }]),
        instantSearchInstance: {},
      });

      {
        const [renderingParameters, isFirstRender] = renderFn.mock.calls[1];

        expect(isFirstRender).toBe(false);

        const {
          userData,
          instantSearchInstance,
          widgetParams,
        } = renderingParameters;

        expect(userData).toEqual([]);
        expect(instantSearchInstance).toEqual({});
        expect(widgetParams).toEqual({});
      }

      widget.render({
        helper,
        results: new SearchResults(helper.getState(), [
          { hits: [], userData: [{ banner: 'image.png' }] },
        ]),
        instantSearchInstance: {},
      });

      {
        const [renderingParameters, isFirstRender] = renderFn.mock.calls[2];

        expect(isFirstRender).toBe(false);

        const {
          userData,
          instantSearchInstance,
          widgetParams,
        } = renderingParameters;

        expect(userData).toEqual([{ banner: 'image.png' }]);
        expect(instantSearchInstance).toEqual({});
        expect(widgetParams).toEqual({});
      }
    });

    test('calls the unmount function on dispose', () => {
      const helper = createFakeHelper();
      const widget = makeWidget({});

      widget.init({ helper, state: helper.state, instantSearchInstance: {} });
      widget.dispose({ state: helper.getState() });

      expect(unmountFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('options', () => {
    describe('transformItems', () => {
      test('is applied to userData', () => {
        const helper = createFakeHelper();
        const widget = makeWidget({
          transformItems: items => items[0],
        });

        widget.init({ helper, state: helper.state, instantSearchInstance: {} });
        widget.render({
          helper,
          results: new SearchResults(helper.getState(), [
            {
              hits: [],
              userData: [{ banner: 'image1.png' }, { banner: 'image2.png' }],
            },
          ]),
          instantSearchInstance: {},
        });

        const [renderingParameters] = renderFn.mock.calls[1];

        const { userData } = renderingParameters;

        expect(userData).toEqual({ banner: 'image1.png' });
      });
    });
  });
});
