import { createInitArgs, createRenderArgs } from '../render-args';

import type { IndexWidget, InstantSearch, Widget } from '../../../types';

const createFakeHelper = (state: Record<string, unknown> = {}) =>
  ({ state } as any);

const createFakeParent = (helper: any): IndexWidget =>
  ({
    getHelper: () => helper,
    getResultsForWidget: () => null,
    getScopedResults: () => [],
    getIndexId: () => 'indexName',
    createURL: () => '',
  } as any);

const createFakeInstantSearch = (): InstantSearch =>
  ({
    renderState: {},
    templatesConfig: {},
    status: 'idle',
    error: undefined,
  } as any);

describe('render-args', () => {
  describe('renderState', () => {
    test('createInitArgs exposes a live view of instantSearchInstance.renderState', () => {
      const instantSearchInstance = createFakeInstantSearch();
      const parent = createFakeParent(createFakeHelper());

      const initArgs = createInitArgs(instantSearchInstance, parent, {});

      const firstRenderState = initArgs.renderState;

      instantSearchInstance.renderState = {
        indexName: { refinementList: {} },
      } as any;

      expect(initArgs.renderState).toBe(instantSearchInstance.renderState);
      expect(initArgs.renderState).not.toBe(firstRenderState);
    });

    test('createRenderArgs exposes a live view of instantSearchInstance.renderState', () => {
      const instantSearchInstance = createFakeInstantSearch();
      const parent = createFakeParent(createFakeHelper());
      const widget = { $$type: 'ais.refinementList' } as unknown as Widget;

      const renderArgs = createRenderArgs(
        instantSearchInstance,
        parent,
        widget
      );

      const firstRenderState = renderArgs.renderState;

      instantSearchInstance.renderState = {
        indexName: { refinementList: {} },
      } as any;

      expect(renderArgs.renderState).toBe(instantSearchInstance.renderState);
      expect(renderArgs.renderState).not.toBe(firstRenderState);
    });
  });
});
