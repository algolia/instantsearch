/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import algoliasearchHelper from 'algoliasearch-helper';

import { mount, nextTick } from '../../../test/utils';
import { renderCompat, shallowRef } from '../../util/vue-compat';
import { useConnector } from '../useConnector';

const createFakeIndexWidget = () => ({
  addWidgets: jest.fn(),
  removeWidgets: jest.fn(),
});

const createFakeInstance = () => ({
  mainIndex: createFakeIndexWidget(),
  started: true,
  status: 'idle',
  renderState: {},
  templatesConfig: {},
  error: undefined,
  client: { search: jest.fn() },
});

// Composition `inject` reads from the parent chain, so the provided values
// must come from a real parent component (unlike the mixin tests, which can
// self-provide through the options API).
const mountComposable = ({ provide, setup }) => {
  const Child = {
    render: () => null,
    setup,
  };

  return mount({
    provide,
    render: renderCompat((h) => h(Child)),
  });
};

describe('useConnector', () => {
  it('creates the widget with additional properties and adds it to the parent index', () => {
    const instance = createFakeInstance();
    const widget = { render: () => {} };
    const factory = jest.fn(() => widget);
    const connector = jest.fn(() => factory);
    const widgetParams = { attribute: 'brand' };
    let state;

    mountComposable({
      provide: { $_ais_instantSearchInstance: instance },
      setup() {
        state = useConnector(connector, widgetParams, {
          $$widgetType: 'ais.test',
        });
        return {};
      },
    });

    expect(connector).toHaveBeenCalledTimes(1);
    expect(factory).toHaveBeenCalledTimes(1);
    expect(factory).toHaveBeenCalledWith(widgetParams);
    expect(instance.mainIndex.addWidgets).toHaveBeenCalledTimes(1);
    expect(instance.mainIndex.addWidgets.mock.calls[0][0]).toEqual([
      { ...widget, $$widgetType: 'ais.test' },
    ]);
    // No `getWidgetRenderState` on the widget: state is `{}`, never null.
    expect(state.value).toEqual({});
  });

  it('uses the injected parent index over the main index', () => {
    const instance = createFakeInstance();
    const indexWidget = createFakeIndexWidget();
    const widget = { render: () => {} };
    const connector = jest.fn(() => () => widget);

    mountComposable({
      provide: {
        $_ais_instantSearchInstance: instance,
        $_ais_getParentIndex: () => indexWidget,
      },
      setup() {
        useConnector(connector);
        return {};
      },
    });

    expect(indexWidget.addWidgets).toHaveBeenCalledWith([widget]);
    expect(instance.mainIndex.addWidgets).not.toHaveBeenCalled();
  });

  it('computes the initial render state synchronously before the instance has started', () => {
    const instance = createFakeInstance();
    instance.started = false;
    instance._initialUiState = { indexName: { query: 'iphone' } };
    const preStartIndex = {
      addWidgets: jest.fn(),
      removeWidgets: jest.fn(),
      getHelper: () => null,
      getIndexId: () => 'indexName',
      getIndexName: () => 'indexName',
    };
    const widget = {
      render: () => {},
      getWidgetSearchParameters: jest.fn((searchParameters, { uiState }) =>
        searchParameters.setQuery(uiState.query || '')
      ),
      getWidgetRenderState: jest.fn(({ state: searchParameters }) => ({
        query: searchParameters.query,
        refine: () => {},
        widgetParams: { ignored: true },
      })),
    };
    const connector = jest.fn(() => () => widget);
    let state;

    mountComposable({
      provide: {
        $_ais_instantSearchInstance: instance,
        $_ais_getParentIndex: () => preStartIndex,
      },
      setup() {
        state = useConnector(connector);
        return {};
      },
    });

    // The ui state is derived from `_initialUiState`, and `widgetParams` is
    // stripped from the render state.
    expect(widget.getWidgetSearchParameters).toHaveBeenCalledWith(
      expect.anything(),
      { uiState: { query: 'iphone' } }
    );
    expect(state.value).toEqual({ query: 'iphone', refine: expect.any(Function) });

    // Results passed to `getWidgetRenderState` are artificial empty results.
    const renderStateArgs = widget.getWidgetRenderState.mock.calls[0][0];
    expect(renderStateArgs.results.__isArtificial).toBe(true);
    expect(renderStateArgs.results.nbHits).toBe(0);
  });

  it('computes the initial render state from the index helper once started', () => {
    const instance = createFakeInstance();
    const helper = algoliasearchHelper(
      { search: jest.fn() },
      'indexName',
      {}
    );
    const startedIndex = {
      addWidgets: jest.fn(),
      removeWidgets: jest.fn(),
      getHelper: () => helper,
      getIndexId: () => 'indexName',
      getIndexName: () => 'indexName',
      getWidgetUiState: () => ({ indexName: { query: 'started' } }),
      getResults: () => null,
      getScopedResults: () => [],
      createURL: () => '#',
    };
    const widget = {
      render: () => {},
      getWidgetSearchParameters: (searchParameters, { uiState }) =>
        searchParameters.setQuery(uiState.query || ''),
      getWidgetRenderState: ({ state: searchParameters }) => ({
        query: searchParameters.query,
        widgetParams: {},
      }),
    };
    const connector = jest.fn(() => () => widget);
    let state;

    mountComposable({
      provide: {
        $_ais_instantSearchInstance: instance,
        $_ais_getParentIndex: () => startedIndex,
      },
      setup() {
        state = useConnector(connector);
        return {};
      },
    });

    expect(state.value).toEqual({ query: 'started' });
  });

  it('skips the init render and commits subsequent renders', () => {
    const instance = createFakeInstance();
    const widget = { render: () => {} };
    const connector = jest.fn(() => () => widget);
    let state;

    mountComposable({
      provide: { $_ais_instantSearchInstance: instance },
      setup() {
        state = useConnector(connector);
        return {};
      },
    });

    const renderCallback = connector.mock.calls[0][0];
    const initialState = state.value;

    renderCallback(
      { instantSearchInstance: instance, widgetParams: {}, items: ['a'] },
      true
    );
    expect(state.value).toBe(initialState);

    renderCallback(
      { instantSearchInstance: instance, widgetParams: {}, items: ['a'] },
      false
    );
    expect(state.value).toEqual({ items: ['a'] });
  });

  it('ignores dequal-equal render states but commits on status change', () => {
    const instance = createFakeInstance();
    const widget = { render: () => {} };
    const connector = jest.fn(() => () => widget);
    let state;

    mountComposable({
      provide: { $_ais_instantSearchInstance: instance },
      setup() {
        state = useConnector(connector);
        return {};
      },
    });

    const renderCallback = connector.mock.calls[0][0];

    renderCallback(
      {
        instantSearchInstance: instance,
        widgetParams: {},
        items: ['a'],
        refine: () => {},
      },
      false
    );
    const committed = state.value;

    // Same data, new function reference: no commit.
    renderCallback(
      {
        instantSearchInstance: instance,
        widgetParams: {},
        items: ['a'],
        refine: () => {},
      },
      false
    );
    expect(state.value).toBe(committed);

    // Same data but the search status changed: commit.
    renderCallback(
      {
        instantSearchInstance: { ...instance, status: 'loading' },
        widgetParams: {},
        items: ['a'],
        refine: () => {},
      },
      false
    );
    expect(state.value).not.toBe(committed);
    expect(state.value).toEqual({ items: ['a'], refine: expect.any(Function) });
  });

  it('recreates the widget only when widget params deep-change', async () => {
    const instance = createFakeInstance();
    const widget = { render: () => {}, dispose: () => {} };
    const factory = jest.fn(() => widget);
    const connector = jest.fn(() => factory);
    const widgetParams = shallowRef({ attribute: 'brand' });
    let state;

    mountComposable({
      provide: { $_ais_instantSearchInstance: instance },
      setup() {
        state = useConnector(connector, widgetParams);
        return {};
      },
    });

    // New object, deep-equal values: no recreation (unlike the mixin).
    widgetParams.value = { attribute: 'brand' };
    await nextTick();
    expect(instance.mainIndex.removeWidgets).not.toHaveBeenCalled();
    expect(factory).toHaveBeenCalledTimes(1);

    // Genuine change: remove-and-recreate, state is not reset.
    widgetParams.value = { attribute: 'price' };
    await nextTick();
    expect(instance.mainIndex.removeWidgets).toHaveBeenCalledTimes(1);
    expect(factory).toHaveBeenCalledTimes(2);
    expect(factory).toHaveBeenLastCalledWith({ attribute: 'price' });
    expect(instance.mainIndex.addWidgets).toHaveBeenCalledTimes(2);
    expect(state.value).not.toBe(null);
  });

  it('removes the widget on unmount and ignores late renders', () => {
    const instance = createFakeInstance();
    const widget = { render: () => {}, dispose: () => {} };
    const connector = jest.fn(() => () => widget);
    let state;

    const wrapper = mountComposable({
      provide: { $_ais_instantSearchInstance: instance },
      setup() {
        state = useConnector(connector);
        return {};
      },
    });

    wrapper.destroy();

    expect(instance.mainIndex.removeWidgets).toHaveBeenCalledWith([widget]);

    // Late connector notification (the <ais-dynamic-widgets> race).
    const renderCallback = connector.mock.calls[0][0];
    const before = state.value;
    renderCallback(
      { instantSearchInstance: instance, widgetParams: {}, items: ['late'] },
      false
    );
    expect(state.value).toBe(before);
  });
});
