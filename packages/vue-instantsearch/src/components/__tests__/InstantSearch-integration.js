/**
 * @jest-environment jsdom
 */

import { mount, nextTick } from '../../../test/utils';
import InstantSearch from '../InstantSearch';
import { createWidgetMixin } from '../../mixins/widget';
import { createFakeClient } from '../../util/testutils/client';
import SearchBox from '../SearchBox.vue';
jest.unmock('instantsearch.js/es');
import '../../../test/utils/sortedHtmlSerializer';

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

it('child widgets get added to its parent instantsearch', () => {
  const widgetInstance = {
    render() {},
  };

  const ChildComponent = {
    mixins: [createWidgetMixin({ connector: () => () => widgetInstance })],

    render() {
      return null;
    },
  };

  const wrapper = mount({
    components: { InstantSearch, ChildComponent },
    data() {
      return {
        props: {
          searchClient: createFakeClient(),
          indexName: 'something',
        },
      };
    },
    template: `
      <InstantSearch v-bind="props">
        <ChildComponent />
      </InstantSearch>
    `,
  });

  expect(
    wrapper
      .findComponent(InstantSearch)
      .vm.instantSearchInstance.mainIndex.getWidgets()
  ).toContain(widgetInstance);
});

describe('middlewares', () => {
  const createFakeMiddleware = () => {
    const middlewareSpy = {
      onStateChange: jest.fn(),
      subscribe: jest.fn(),
      unsubscribe: jest.fn(),
    };
    const middleware = jest.fn(() => middlewareSpy);

    return [middleware, middlewareSpy];
  };

  it('subscribes middlewares', async () => {
    const [middleware, middlewareSpy] = createFakeMiddleware();

    mount(InstantSearch, {
      propsData: {
        searchClient: createFakeClient(),
        indexName: 'indexName',
        middlewares: [middleware],
      },
    });
    await nextTick();

    expect(middlewareSpy.subscribe).toHaveBeenCalledTimes(1);
  });

  it('subscribes newly added middleware', async () => {
    const [middleware1, middlewareSpy1] = createFakeMiddleware();

    const wrapper = mount({
      components: {
        AisInstantSearch: InstantSearch,
        AisSearchBox: SearchBox,
      },
      template: `
        <ais-instant-search
          :search-client="searchClient"
          :index-name="indexName"
          :middlewares="middlewares"
        >
          <ais-search-box />
        </ais-instant-search>
      `,
      data() {
        return {
          searchClient: createFakeClient(),
          indexName: 'indexName',
          middlewares: [middleware1],
        };
      },
    });

    await wait(20);
    expect(middlewareSpy1.subscribe).toHaveBeenCalledTimes(1);

    await wrapper.find('input').setValue('a');
    await nextTick();

    expect(middlewareSpy1.onStateChange).toHaveBeenCalledTimes(1);
    expect(middlewareSpy1.onStateChange).toHaveBeenCalledWith({
      uiState: { indexName: { query: 'a' } },
    });

    const [middleware2, middlewareSpy2] = createFakeMiddleware();
    await wrapper.setData({
      middlewares: [middleware1, middleware2],
    });
    await nextTick();

    expect(middlewareSpy2.subscribe).toHaveBeenCalledTimes(1);
    expect(middlewareSpy2.onStateChange).toHaveBeenCalledTimes(0);

    await wrapper.find('input').setValue('b');
    await nextTick();

    expect(middlewareSpy1.onStateChange).toHaveBeenCalledTimes(2);
    expect(middlewareSpy1.onStateChange).toHaveBeenCalledWith({
      uiState: { indexName: { query: 'b' } },
    });
    expect(middlewareSpy2.onStateChange).toHaveBeenCalledTimes(1);
    expect(middlewareSpy2.onStateChange).toHaveBeenCalledWith({
      uiState: { indexName: { query: 'b' } },
    });

    expect(middlewareSpy1.unsubscribe).toHaveBeenCalledTimes(0);
    expect(middlewareSpy2.unsubscribe).toHaveBeenCalledTimes(0);
  });

  it('unsubscribes removed middleware', async () => {
    const [middleware1, middlewareSpy1] = createFakeMiddleware();
    const [middleware2, middlewareSpy2] = createFakeMiddleware();

    const wrapper = mount({
      components: {
        AisInstantSearch: InstantSearch,
        AisSearchBox: SearchBox,
      },
      template: `
        <ais-instant-search
          :search-client="searchClient"
          :index-name="indexName"
          :middlewares="middlewares"
        >
          <ais-search-box />
        </ais-instant-search>
      `,
      data() {
        return {
          searchClient: createFakeClient(),
          indexName: 'indexName',
          middlewares: [middleware1, middleware2],
        };
      },
    });

    await wait(20);
    expect(middlewareSpy1.subscribe).toHaveBeenCalledTimes(1);
    expect(middlewareSpy2.subscribe).toHaveBeenCalledTimes(1);

    await wrapper.find('input').setValue('a');
    await nextTick();

    expect(middlewareSpy1.onStateChange).toHaveBeenCalledTimes(1);
    expect(middlewareSpy1.onStateChange).toHaveBeenCalledWith({
      uiState: { indexName: { query: 'a' } },
    });
    expect(middlewareSpy2.onStateChange).toHaveBeenCalledTimes(1);
    expect(middlewareSpy2.onStateChange).toHaveBeenCalledWith({
      uiState: { indexName: { query: 'a' } },
    });

    await wrapper.setData({ middlewares: [middleware1] });

    expect(middlewareSpy1.unsubscribe).toHaveBeenCalledTimes(0);
    expect(middlewareSpy2.unsubscribe).toHaveBeenCalledTimes(1);

    await wrapper.find('input').setValue('b');
    await nextTick();

    expect(middlewareSpy1.onStateChange).toHaveBeenCalledTimes(2);
    expect(middlewareSpy1.onStateChange).toHaveBeenCalledWith({
      uiState: { indexName: { query: 'b' } },
    });
    expect(middlewareSpy2.onStateChange).toHaveBeenCalledTimes(1);
  });
});
