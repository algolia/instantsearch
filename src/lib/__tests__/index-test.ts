import algoliasearchHelper from 'algoliasearch-helper';
import { createSearchClient } from '../../../test/mock/createSearchClient';
import { createInstantSearch } from '../../../test/mock/createInstantSearch';
import {
  createWidget,
  createInitOptions,
  createRenderOptions,
  createDisposeOptions,
} from '../../../test/mock/createWidget';
import { runAllMicroTasks } from '../../../test/utils/runAllMicroTasks';
import { Widget } from '../../types';
import index from '../index';

describe('index', () => {
  const createSearchBox = (args: Partial<Widget> = {}): Widget =>
    createWidget({
      getConfiguration: jest.fn(() => {
        return {
          query: 'Apple',
        };
      }),
      dispose: jest.fn(({ state }) => {
        return state.setQueryParameter('query', undefined);
      }),
      ...args,
    });

  const createPagination = (args: Partial<Widget> = {}): Widget =>
    createWidget({
      getConfiguration: jest.fn(() => {
        return {
          page: 5,
        };
      }),
      dispose: jest.fn(({ state }) => {
        return state.setQueryParameter('page', undefined);
      }),
      ...args,
    });

  it('throws without argument', () => {
    expect(() => {
      // @ts-ignore
      index();
    }).toThrowErrorMatchingInlineSnapshot(`
"The \`indexName\` option is required.

See documentation: https://www.algolia.com/doc/api-reference/widgets/index/js/"
`);
  });

  it('throws without `indexName` option', () => {
    expect(() => {
      index({} as any);
    }).toThrowErrorMatchingInlineSnapshot(`
"The \`indexName\` option is required.

See documentation: https://www.algolia.com/doc/api-reference/widgets/index/js/"
`);
  });

  describe('addWidgets', () => {
    it('adds given widgets to the instance', () => {
      const instance = index({ indexName: 'index_name' });

      expect(instance.getWidgets()).toHaveLength(0);

      instance.addWidgets([createSearchBox(), createPagination()]);

      expect(instance.getWidgets()).toHaveLength(2);
    });

    it('returns the instance to be able to chain the calls', () => {
      const topLevelIndex = index({ indexName: 'top_level_index_name' });
      const subLevelIndex = index({ indexName: 'sub_level_index_name' });

      topLevelIndex.addWidgets([
        subLevelIndex.addWidgets([createSearchBox(), createPagination()]),
      ]);

      expect(topLevelIndex.getWidgets()).toHaveLength(1);
      expect(topLevelIndex.getWidgets()).toEqual([subLevelIndex]);
    });

    it('does not throw an error without the `init` step', () => {
      const topLevelIndex = index({ indexName: 'top_level_index_name' });
      const subLevelIndex = index({ indexName: 'sub_level_index_name' });

      expect(() => topLevelIndex.addWidgets([subLevelIndex])).not.toThrow();
    });

    it('throws an error with a value different than `array`', () => {
      const instance = index({ indexName: 'index_name' });

      expect(() => {
        // @ts-ignore
        instance.addWidgets();
      }).toThrow();

      expect(() => {
        instance.addWidgets(createWidget() as any);
      }).toThrowErrorMatchingInlineSnapshot(`
"The \`addWidgets\` method expects an array of widgets.

See documentation: https://www.algolia.com/doc/api-reference/widgets/index/js/"
`);
    });

    it('throws an error with widgets that do not implement `init` or `render`', () => {
      const instance = index({ indexName: 'index_name' });

      expect(() => {
        instance.addWidgets([{ dummy: true } as any]);
      }).toThrowErrorMatchingInlineSnapshot(`
"The widget definition expects a \`render\` and/or an \`init\` method.

See documentation: https://www.algolia.com/doc/api-reference/widgets/index/js/"
`);
    });

    describe('with a started instance', () => {
      it('updates the internal state with added widgets', () => {
        const instance = index({ indexName: 'index_name' });
        const instantSearchInstance = createInstantSearch();

        instance.addWidgets([createSearchBox()]);

        instance.init!(
          createInitOptions({
            instantSearchInstance,
          })
        );

        expect(instance.getHelper()!.state).toEqual(
          algoliasearchHelper.SearchParameters.make({
            index: 'index_name',
            query: 'Apple',
          })
        );

        instance.addWidgets([createPagination()]);

        expect(instance.getHelper()!.state).toEqual(
          algoliasearchHelper.SearchParameters.make({
            index: 'index_name',
            query: 'Apple',
            page: 5,
          })
        );
      });

      it('calls `init` on the added widgets', () => {
        const instance = index({ indexName: 'index_name' });
        const instantSearchInstance = createInstantSearch();
        const widgets = [createSearchBox(), createPagination()];

        instance.init!(
          createInitOptions({
            instantSearchInstance,
          })
        );

        widgets.forEach(widget => {
          expect(widget.init).toHaveBeenCalledTimes(0);
        });

        instance.addWidgets(widgets);

        widgets.forEach(widget => {
          expect(widget.init).toHaveBeenCalledTimes(1);
          expect(widget.init).toHaveBeenCalledWith({
            instantSearchInstance,
            parent: instance,
            helper: instance.getHelper(),
            state: instance.getHelper()!.state,
            templatesConfig: instantSearchInstance.templatesConfig,
            createURL: instantSearchInstance._createAbsoluteURL,
            onHistoryChange: instantSearchInstance._onHistoryChange,
          });
        });
      });

      it('schedules a search to take the added widgets into account', () => {
        const instance = index({ indexName: 'index_name' });
        const instantSearchInstance = createInstantSearch({
          scheduleSearch: jest.fn(),
        });

        instance.init!(
          createInitOptions({
            instantSearchInstance,
          })
        );

        expect(instantSearchInstance.scheduleSearch).toHaveBeenCalledTimes(0);

        instance.addWidgets([createSearchBox()]);

        expect(instantSearchInstance.scheduleSearch).toHaveBeenCalledTimes(1);
      });

      it('does not trigger a search without widgets to add', () => {
        const instance = index({ indexName: 'index_name' });
        const instantSearchInstance = createInstantSearch({
          scheduleSearch: jest.fn(),
        });

        instance.init!(
          createInitOptions({
            instantSearchInstance,
          })
        );

        expect(instantSearchInstance.scheduleSearch).toHaveBeenCalledTimes(0);

        instance.addWidgets([]);

        expect(instantSearchInstance.scheduleSearch).toHaveBeenCalledTimes(0);
      });
    });
  });

  describe('removeWidgets', () => {
    it('removes given widget from the instance', () => {
      const instance = index({ indexName: 'index_name' });
      const searchBox = createSearchBox();
      const pagination = createPagination();

      instance.addWidgets([searchBox, pagination]);

      expect(instance.getWidgets()).toHaveLength(2);

      instance.removeWidgets([pagination]);

      expect(instance.getWidgets()).toEqual([searchBox]);
    });

    it('removes given widgets from the instance', () => {
      const instance = index({ indexName: 'index_name' });
      const searchBox = createSearchBox();
      const pagination = createPagination();

      instance.addWidgets([searchBox, pagination]);

      expect(instance.getWidgets()).toHaveLength(2);

      instance.removeWidgets([searchBox, pagination]);

      expect(instance.getWidgets()).toHaveLength(0);
    });

    it('returns the instance to be able to chain the calls', () => {
      const topLevelInstance = index({ indexName: 'top_level_index_name' });
      const subLevelInstance = index({ indexName: 'sub_level_index_name' });
      const searchBox = createSearchBox();
      const pagination = createPagination();

      topLevelInstance.addWidgets([
        subLevelInstance
          .addWidgets([searchBox, pagination])
          .removeWidgets([searchBox, pagination]),
      ]);

      expect(topLevelInstance.getWidgets()).toHaveLength(1);
      expect(topLevelInstance.getWidgets()).toEqual([subLevelInstance]);
    });

    it('does not throw an error without the `init` step', () => {
      const topLevelInstance = index({ indexName: 'top_level_index_name' });
      const subLevelIndex = index({ indexName: 'sub_level_index_name' });

      topLevelInstance.addWidgets([subLevelIndex]);

      expect(() =>
        topLevelInstance.removeWidgets([subLevelIndex])
      ).not.toThrow();
    });

    it('throws an error with a value different than `array`', () => {
      const instance = index({ indexName: 'index_name' });

      expect(() => {
        // @ts-ignore
        instance.removeWidgets();
      }).toThrow();

      expect(() => {
        instance.removeWidgets(createWidget() as any);
      }).toThrowErrorMatchingInlineSnapshot(`
"The \`removeWidgets\` method expects an array of widgets.

See documentation: https://www.algolia.com/doc/api-reference/widgets/index/js/"
`);
    });

    it('throws an error with widgets that do not implement `dispose`', () => {
      const instance = index({ indexName: 'index_name' });

      expect(() => {
        instance.removeWidgets([{ dummy: true } as any]);
      }).toThrowErrorMatchingInlineSnapshot(`
"The widget definition expects a \`dispose\` method.

See documentation: https://www.algolia.com/doc/api-reference/widgets/index/js/"
`);
    });

    describe('with a started instance', () => {
      it('updates the internal state with removed widgets', () => {
        const instance = index({ indexName: 'index_name' });
        const instantSearchInstance = createInstantSearch();
        const pagination = createPagination();

        instance.addWidgets([createSearchBox(), pagination]);

        instance.init!(
          createInitOptions({
            instantSearchInstance,
          })
        );

        expect(instance.getHelper()!.state).toEqual(
          algoliasearchHelper.SearchParameters.make({
            index: 'index_name',
            query: 'Apple',
            page: 5,
          })
        );

        instance.removeWidgets([pagination]);

        expect(instance.getHelper()!.state).toEqual(
          algoliasearchHelper.SearchParameters.make({
            index: 'index_name',
            query: 'Apple',
          })
        );
      });

      it('calls `dispose` on the removed widgets', () => {
        const instance = index({ indexName: 'index_name' });
        const instantSearchInstance = createInstantSearch();
        const widgets = [
          createSearchBox({
            dispose: jest.fn(),
          }),
          createPagination({
            dispose: jest.fn(),
          }),
        ];

        instance.addWidgets(widgets);

        instance.init!(
          createInitOptions({
            instantSearchInstance,
          })
        );

        widgets.forEach(widget => {
          expect(widget.dispose).toHaveBeenCalledTimes(0);
        });

        instance.removeWidgets(widgets);

        widgets.forEach(widget => {
          expect(widget.dispose).toHaveBeenCalledTimes(1);
          expect(widget.dispose).toHaveBeenCalledWith({
            helper: instance.getHelper(),
            state: instance.getHelper()!.state,
          });
        });
      });

      it('schedules a search to take the removed widgets into account', () => {
        const instance = index({ indexName: 'index_name' });
        const instantSearchInstance = createInstantSearch({
          scheduleSearch: jest.fn(),
        });

        const searchBox = createSearchBox();

        instance.addWidgets([searchBox, createPagination()]);

        instance.init!(
          createInitOptions({
            instantSearchInstance,
          })
        );

        expect(instantSearchInstance.scheduleSearch).toHaveBeenCalledTimes(0);

        instance.removeWidgets([searchBox]);

        expect(instantSearchInstance.scheduleSearch).toHaveBeenCalledTimes(1);
      });

      it('does not schedule a search without widgets to remove', () => {
        const instance = index({ indexName: 'index_name' });
        const instantSearchInstance = createInstantSearch({
          scheduleSearch: jest.fn(),
        });

        const searchBox = createSearchBox();

        instance.addWidgets([searchBox]);

        instance.init!(
          createInitOptions({
            instantSearchInstance,
          })
        );

        expect(instantSearchInstance.scheduleSearch).toHaveBeenCalledTimes(0);

        instance.removeWidgets([]);

        expect(instantSearchInstance.scheduleSearch).toHaveBeenCalledTimes(0);
      });

      it('does not schedule a search without widgets in the index', () => {
        const instance = index({ indexName: 'index_name' });
        const instantSearchInstance = createInstantSearch({
          scheduleSearch: jest.fn(),
        });

        const searchBox = createSearchBox();

        instance.addWidgets([searchBox]);

        instance.init!(
          createInitOptions({
            instantSearchInstance,
          })
        );

        expect(instantSearchInstance.scheduleSearch).toHaveBeenCalledTimes(0);

        instance.removeWidgets([searchBox]);

        expect(instantSearchInstance.scheduleSearch).toHaveBeenCalledTimes(0);
      });
    });
  });

  describe('init', () => {
    it('forwards the `search` call to the main instance', () => {
      const instance = index({ indexName: 'index_name' });
      const mainHelper = algoliasearchHelper({} as any, '', {});
      const instantSearchInstance = createInstantSearch({
        mainHelper,
      });

      const search = jest.spyOn(mainHelper, 'search').mockImplementation();

      instance.init!(
        createInitOptions({
          instantSearchInstance,
        })
      );

      // Simulate a call to search from a widget
      instance.getHelper()!.search();

      expect(search).toHaveBeenCalledTimes(1);
    });

    it('forwards the `searchForFacetValues` call to the main instance', () => {
      const instance = index({ indexName: 'index_name' });
      const mainHelper = algoliasearchHelper({} as any, '', {});
      const instantSearchInstance = createInstantSearch({
        mainHelper,
      });

      const searchForFacetValues = jest
        .spyOn(mainHelper, 'searchForFacetValues')
        .mockImplementation();

      instance.init!(
        createInitOptions({
          instantSearchInstance,
        })
      );

      // Simulate a call to searchForFacetValues from a widget
      instance.getHelper()!.searchForFacetValues('brand', 'Apple', 10, {
        highlightTags: 'mark',
      });

      expect(searchForFacetValues).toHaveBeenCalledTimes(1);
      expect(searchForFacetValues).toHaveBeenCalledWith(
        'brand',
        'Apple',
        10,
        expect.objectContaining({
          index: 'index_name',
          highlightTags: 'mark',
        })
      );
    });

    it('uses `searchParameters` for the top level index', () => {
      const instance = index({ indexName: 'index_name' });
      const instantSearchInstance = createInstantSearch({
        _searchParameters: {
          hitsPerPage: 5,
          disjunctiveFacetsRefinements: { brand: ['Apple'] },
          disjunctiveFacets: ['brand'],
        },
      });

      instance.init!(
        createInitOptions({
          instantSearchInstance,
        })
      );

      expect(instance.getHelper()!.state).toEqual(
        algoliasearchHelper.SearchParameters.make({
          index: 'index_name',
          hitsPerPage: 5,
          disjunctiveFacetsRefinements: { brand: ['Apple'] },
          disjunctiveFacets: ['brand'],
        })
      );
    });

    it('does not use `searchParameters` for sub level indices ', () => {
      const topLevelInstance = index({ indexName: 'top_level_index_name' });
      const subLevelInstance = index({ indexName: 'sub_level_index_name' });
      const instantSearchInstance = createInstantSearch({
        _searchParameters: {
          hitsPerPage: 5,
          disjunctiveFacetsRefinements: { brand: ['Apple'] },
          disjunctiveFacets: ['brand'],
        },
      });

      subLevelInstance.init!(
        createInitOptions({
          instantSearchInstance,
          parent: topLevelInstance,
        })
      );

      expect(subLevelInstance.getHelper()!.state).toEqual(
        algoliasearchHelper.SearchParameters.make({
          index: 'sub_level_index_name',
        })
      );
    });

    it('uses the internal state for the queries', () => {
      const instance = index({ indexName: 'index_name' });
      const searchClient = createSearchClient();
      const mainHelper = algoliasearchHelper(searchClient, '', {});
      const instantSearchInstance = createInstantSearch({
        mainHelper,
      });

      instance.addWidgets([createSearchBox(), createPagination()]);

      instance.init!(
        createInitOptions({
          instantSearchInstance,
        })
      );

      // Simulate a call to search from a widget
      instance.getHelper()!.search();

      expect(searchClient.search).toHaveBeenCalledWith(
        expect.arrayContaining([
          {
            indexName: 'index_name',
            params: expect.objectContaining({
              query: 'Apple',
              page: 5,
            }),
          },
        ])
      );
    });

    it('uses the internal state for the SFFV queries', () => {
      const instance = index({ indexName: 'index_name' });
      const searchClient = createSearchClient();
      const mainHelper = algoliasearchHelper(searchClient, '', {});
      const instantSearchInstance = createInstantSearch({
        mainHelper,
      });

      instance.addWidgets([createSearchBox(), createPagination()]);

      instance.init!(
        createInitOptions({
          instantSearchInstance,
        })
      );

      // Simulate a call to search from a widget
      instance.getHelper()!.searchForFacetValues('brand', 'Apple', 10, {
        highlightTags: 'mark',
      });

      expect(searchClient.searchForFacetValues).toHaveBeenCalledTimes(1);
      expect(searchClient.searchForFacetValues).toHaveBeenCalledWith(
        expect.arrayContaining([
          {
            indexName: 'index_name',
            params: expect.objectContaining({
              facetName: 'brand',
              facetQuery: 'Apple',
              maxFacetHits: 10,
              highlightTags: 'mark',
              page: 5,
            }),
          },
        ])
      );
    });

    it('schedules a render on DerivedHelper results', async () => {
      const instance = index({ indexName: 'index_name' });
      const searchClient = createSearchClient();
      const mainHelper = algoliasearchHelper(searchClient, '', {});
      const instantSearchInstance = createInstantSearch({
        mainHelper,
      });

      instance.init!(
        createInitOptions({
          instantSearchInstance,
        })
      );

      // Simulate a call to search from a widget
      instance.getHelper()!.search();

      expect(instantSearchInstance.scheduleRender).toHaveBeenCalledTimes(0);

      await runAllMicroTasks();

      expect(instantSearchInstance.scheduleRender).toHaveBeenCalledTimes(1);
    });

    it('schedules a stalled render on DerivedHelper search', () => {
      const instance = index({ indexName: 'index_name' });
      const searchClient = createSearchClient();
      const mainHelper = algoliasearchHelper(searchClient, '', {});
      const instantSearchInstance = createInstantSearch({
        mainHelper,
      });

      instance.init!(
        createInitOptions({
          instantSearchInstance,
        })
      );

      expect(instantSearchInstance.scheduleStalledRender).toHaveBeenCalledTimes(
        0
      );

      // Simulate a call to search from a widget
      instance.getHelper()!.search();

      expect(instantSearchInstance.scheduleStalledRender).toHaveBeenCalledTimes(
        1
      );
    });

    it('calls `init` on its widgets', () => {
      const instance = index({ indexName: 'index_name' });
      const instantSearchInstance = createInstantSearch();
      const widgets = [createSearchBox(), createPagination()];

      instance.addWidgets(widgets);

      widgets.forEach(widget => {
        expect(widget.init).toHaveBeenCalledTimes(0);
      });

      instance.init!(
        createInitOptions({
          instantSearchInstance,
        })
      );

      widgets.forEach(widget => {
        expect(widget.init).toHaveBeenCalledTimes(1);
        expect(widget.init).toHaveBeenCalledWith({
          instantSearchInstance,
          parent: instance,
          helper: instance.getHelper(),
          state: instance.getHelper()!.state,
          templatesConfig: instantSearchInstance.templatesConfig,
          createURL: instantSearchInstance._createAbsoluteURL,
          onHistoryChange: instantSearchInstance._onHistoryChange,
        });
      });
    });
  });

  describe('render', () => {
    it('calls `render` on its widgets', async () => {
      const instance = index({ indexName: 'index_name' });
      const searchClient = createSearchClient();
      const mainHelper = algoliasearchHelper(searchClient, '', {});
      const instantSearchInstance = createInstantSearch({
        mainHelper,
      });

      const widgets = [createSearchBox(), createPagination()];

      instance.addWidgets(widgets);

      widgets.forEach(widget => {
        expect(widget.render).toHaveBeenCalledTimes(0);
      });

      instance.init!(
        createInitOptions({
          instantSearchInstance,
        })
      );

      // Simulate a call to search from a widget - this step is required otherwise
      // the DerivedHelper does not contain the results. The `lastResults` attribute
      // is set once the `result` event is emitted.
      instance.getHelper()!.search();

      await runAllMicroTasks();

      widgets.forEach(widget => {
        expect(widget.render).toHaveBeenCalledTimes(0);
      });

      instance.render!(
        createRenderOptions({
          instantSearchInstance,
        })
      );

      widgets.forEach(widget => {
        expect(widget.render).toHaveBeenCalledTimes(1);
        expect(widget.render).toHaveBeenCalledWith({
          instantSearchInstance,
          results: expect.any(algoliasearchHelper.SearchResults),
          state: expect.any(algoliasearchHelper.SearchParameters),
          helper: instance.getHelper(),
          templatesConfig: instantSearchInstance.templatesConfig,
          createURL: instantSearchInstance._createAbsoluteURL,
          searchMetadata: {
            isSearchStalled: instantSearchInstance._isSearchStalled,
          },
        });
      });
    });
  });

  describe('dispose', () => {
    it('calls `dispose` on its widgets', () => {
      const instance = index({ indexName: 'index_name' });
      const instantSearchInstance = createInstantSearch();
      const widgets = [createSearchBox(), createPagination()];

      instance.addWidgets(widgets);

      instance.init!(
        createInitOptions({
          instantSearchInstance,
        })
      );

      widgets.forEach(widget => {
        expect(widget.dispose).toHaveBeenCalledTimes(0);
      });

      // Save the Helper to be able to simulate the search
      const helper = instance.getHelper();

      instance.dispose!(
        createDisposeOptions({
          helper: instantSearchInstance.helper!,
          state: instantSearchInstance.helper!.state,
        })
      );

      widgets.forEach(widget => {
        expect(widget.dispose).toHaveBeenCalledTimes(1);
        expect(widget.dispose).toHaveBeenCalledWith({
          state: helper!.state,
          helper,
        });
      });
    });

    it('keeps the widgets on the index', () => {
      const instance = index({ indexName: 'index_name' });
      const instantSearchInstance = createInstantSearch();
      const searchBox = createSearchBox();
      const pagination = createPagination();

      instance.addWidgets([searchBox, pagination]);

      instance.init!(
        createInitOptions({
          instantSearchInstance,
        })
      );

      expect(instance.getWidgets()).toHaveLength(2);

      instance.dispose!(createDisposeOptions());

      expect(instance.getWidgets()).toHaveLength(2);
    });

    it('removes the internal Helper', () => {
      const instance = index({ indexName: 'index_name' });
      const instantSearchInstance = createInstantSearch();

      instance.init!(
        createInitOptions({
          instantSearchInstance,
        })
      );

      expect(instance.getHelper()).toBeDefined();

      instance.dispose!(createDisposeOptions());

      expect(instance.getHelper()).toBe(null);
    });

    it('removes the listeners on DerivedHelper', async () => {
      const scheduleRender = jest.fn();
      const instance = index({ indexName: 'index_name' });
      const searchClient = createSearchClient();
      const mainHelper = algoliasearchHelper(searchClient, '', {});
      const instantSearchInstance = createInstantSearch({
        scheduleRender,
        mainHelper,
      });

      instance.init!(
        createInitOptions({
          instantSearchInstance,
        })
      );

      // Save the Helper to be able to simulate the search
      const helper = instance.getHelper();

      instance.dispose!(createDisposeOptions());

      // Simulate a call to search from a widget
      helper!.search();

      expect(scheduleRender).toHaveBeenCalledTimes(0);

      await runAllMicroTasks();

      expect(scheduleRender).toHaveBeenCalledTimes(0);
    });

    it('removes the DerivedHelper', () => {
      const instance = index({ indexName: 'index_name' });
      const searchClient = createSearchClient();
      const mainHelper = algoliasearchHelper(searchClient, '', {});
      const instantSearchInstance = createInstantSearch({
        mainHelper,
      });

      instance.init!(
        createInitOptions({
          instantSearchInstance,
        })
      );

      expect(mainHelper.derivedHelpers).toHaveLength(1);

      instance.dispose!(createDisposeOptions());

      expect(mainHelper.derivedHelpers).toHaveLength(0);
    });
  });
});
