import algoliasearchHelper, { SearchResults } from 'algoliasearch-helper';
import { createInstantSearch } from '../../../../test/mock/createInstantSearch';
import { createSearchClient } from '../../../../test/mock/createSearchClient';
import {
  createInitOptions,
  createRenderOptions,
} from '../../../../test/mock/createWidget';
import { createSingleSearchResponse } from '../../../../test/mock/createAPIResponse';
jest.mock('../../../lib/utils/debounce', () => ({
  debounce: jest.fn(callback => (...args) => setTimeout(callback(...args), 0)),
}));
import { debounce } from '../../../lib/utils/debounce';
import connectAnswers from '../connectAnswers';

const wait = (time = 10) => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, time);
  });
};

describe('connectAnswers', () => {
  describe('Usage', () => {
    it('throws without render function', () => {
      expect(() => {
        // @ts-ignore: test connectAnswers with invalid parameters
        connectAnswers()({});
      }).toThrowErrorMatchingInlineSnapshot(`
"The render function is not valid (received type Undefined).

See documentation: https://www.algolia.com/doc/api-reference/widgets/answers/js/#connector"
`);
    });
  });

  const setupTestEnvironment = ({
    hits,
    attributesForPrediction = ['description'],
  }) => {
    const renderFn = jest.fn();
    const unmountFn = jest.fn();
    const client = createSearchClient({
      // @ts-ignore-next-line
      initIndex() {
        return {
          findAnswers: () => Promise.resolve({ hits }),
        };
      },
    });
    const instantSearchInstance = createInstantSearch({ client });
    const makeWidget = connectAnswers(renderFn, unmountFn);
    const widget = makeWidget({ attributesForPrediction });

    const helper = algoliasearchHelper(client, '', {});

    return {
      renderFn,
      unmountFn,
      instantSearchInstance,
      widget,
      helper,
    };
  };

  it('is a widget', () => {
    const render = jest.fn();
    const unmount = jest.fn();

    const makeWidget = connectAnswers(render, unmount);
    const widget = makeWidget({
      attributesForPrediction: ['description'],
    });

    expect(widget).toEqual(
      expect.objectContaining({
        $$type: 'ais.answers',
        init: expect.any(Function),
        render: expect.any(Function),
        dispose: expect.any(Function),
        getRenderState: expect.any(Function),
        getWidgetRenderState: expect.any(Function),
        getWidgetSearchParameters: expect.any(Function),
      })
    );
  });

  it('Renders during init and render', () => {
    const {
      renderFn,
      widget,
      instantSearchInstance,
      helper,
    } = setupTestEnvironment({ hits: [] });

    expect(renderFn).toHaveBeenCalledTimes(0);

    widget.init!(
      createInitOptions({
        instantSearchInstance,
        state: helper.state,
        helper,
      })
    );

    expect(renderFn).toHaveBeenCalledTimes(1);
    expect(renderFn).toHaveBeenLastCalledWith(
      expect.objectContaining({
        instantSearchInstance,
        hits: [],
        isLoading: false,
        widgetParams: {
          attributesForPrediction: ['description'],
        },
      }),
      true
    );

    widget.render!(
      createRenderOptions({
        results: new SearchResults(helper.state, [
          createSingleSearchResponse({ hits: [] }),
        ]),
        state: helper.state,
        instantSearchInstance,
        helper,
      })
    );

    expect(renderFn).toHaveBeenCalledTimes(2);
    expect(renderFn).toHaveBeenLastCalledWith(
      expect.objectContaining({
        instantSearchInstance,
        hits: [],
        isLoading: false,
        widgetParams: {
          attributesForPrediction: ['description'],
        },
      }),
      false
    );
  });

  it('renders empty hits when query is not given', () => {
    const {
      renderFn,
      widget,
      helper,
      instantSearchInstance,
    } = setupTestEnvironment({ hits: [] });

    widget.init!(
      createInitOptions({
        instantSearchInstance,
        state: helper.state,
        helper,
      })
    );

    helper.state.query = '';

    widget.render!(
      createRenderOptions({
        results: new SearchResults(helper.state, [
          createSingleSearchResponse({ hits: [] }),
        ]),
        state: helper.state,
        instantSearchInstance,
        helper,
      })
    );

    expect(renderFn).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        instantSearchInstance,
        hits: [],
        isLoading: false,
        widgetParams: {
          attributesForPrediction: ['description'],
        },
      }),
      false
    );
  });

  it('renders loader and results when query is given', async () => {
    const hits = [{ title: '' }];
    const hitsWithPosition = [{ title: '', __position: 1 }];
    const {
      renderFn,
      instantSearchInstance,
      widget,
      helper,
    } = setupTestEnvironment({ hits });

    widget.init!(
      createInitOptions({
        instantSearchInstance,
        state: helper.state,
        helper,
      })
    );

    helper.state.query = 'a';
    widget.render!(
      createRenderOptions({
        state: helper.state,
        instantSearchInstance,
        helper,
      })
    );

    // render with isLoading and no hit
    expect(renderFn).toHaveBeenCalledTimes(2);
    expect(renderFn).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        hits: [],
        isLoading: true,
      }),
      false
    );

    await wait();

    // render with hits
    expect(renderFn).toHaveBeenCalledTimes(3);
    expect(renderFn).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({
        hits: hitsWithPosition,
        isLoading: false,
      }),
      false
    );
  });

  it('debounces renders', async () => {
    (debounce as jest.Mock).mockImplementation(
      jest.requireActual('../../../lib/utils/debounce').debounce
    );
    const hits = [{ title: '' }];
    const hitsWithPosition = [{ title: '', __position: 1 }];
    const {
      renderFn,
      instantSearchInstance,
      widget,
      helper,
    } = setupTestEnvironment({ hits });

    widget.init!(
      createInitOptions({
        instantSearchInstance,
        state: helper.state,
        helper,
      })
    );

    helper.state.query = 'a';
    widget.render!(
      createRenderOptions({
        state: helper.state,
        instantSearchInstance,
        helper,
      })
    );

    // render with isLoading and no hit
    expect(renderFn).toHaveBeenCalledTimes(2);
    expect(renderFn).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        hits: [],
        isLoading: true,
      }),
      false
    );

    // another query
    helper.state.query = 'ab';
    widget.render!(
      createRenderOptions({
        state: helper.state,
        instantSearchInstance,
        helper,
      })
    );

    // no debounce for rendering loader
    expect(renderFn).toHaveBeenCalledTimes(3);

    // wait for debounce
    await wait(300);

    expect(renderFn).toHaveBeenCalledTimes(4);
    expect(renderFn).toHaveBeenNthCalledWith(
      4,
      expect.objectContaining({
        hits: hitsWithPosition,
        isLoading: false,
      }),
      false
    );

    // wait
    await wait(300);
    // but no more rendering
    expect(renderFn).toHaveBeenCalledTimes(4);
  });

  describe('getRenderState', () => {
    it('returns the render state', () => {
      const { instantSearchInstance, widget, helper } = setupTestEnvironment({
        hits: [],
      });

      expect(
        widget.getRenderState(
          {},
          createInitOptions({
            instantSearchInstance,
            state: helper.state,
            helper,
          })
        )
      ).toEqual({
        answers: {
          hits: [],
          isLoading: false,
          widgetParams: { attributesForPrediction: ['description'] },
        },
      });

      widget.init!(
        createInitOptions({
          instantSearchInstance,
          state: helper.state,
          helper,
        })
      );

      expect(
        widget.getRenderState(
          {},
          createInitOptions({
            instantSearchInstance,
            state: helper.state,
            helper,
          })
        )
      ).toEqual({
        answers: {
          hits: [],
          isLoading: false,
          widgetParams: { attributesForPrediction: ['description'] },
        },
      });
    });
  });

  describe('getWidgetRenderState', () => {
    it('returns the widget render state', async () => {
      const { instantSearchInstance, widget, helper } = setupTestEnvironment({
        hits: [{ title: '' }],
      });

      widget.init!(
        createInitOptions({
          instantSearchInstance,
          state: helper.state,
          helper,
        })
      );

      helper.state.query = 'a';
      widget.render!(
        createRenderOptions({
          instantSearchInstance,
          state: helper.state,
          helper,
        })
      );

      // render the loading state
      expect(
        widget.getWidgetRenderState(
          createRenderOptions({
            instantSearchInstance,
            state: helper.state,
            helper,
          })
        )
      ).toEqual({
        hits: [],
        isLoading: true,
        widgetParams: {
          attributesForPrediction: ['description'],
        },
      });

      await wait();

      expect(
        widget.getWidgetRenderState(
          createRenderOptions({
            instantSearchInstance,
            state: helper.state,
            helper,
          })
        )
      ).toEqual({
        hits: [{ title: '', __position: 1 }],
        isLoading: false,
        widgetParams: {
          attributesForPrediction: ['description'],
        },
      });
    });
  });
});
