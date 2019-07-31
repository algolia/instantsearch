import algoliasearchHelper, { SearchParameters } from 'algoliasearch-helper';
import { createSearchClient } from '../../../../test/mock/createSearchClient';
import { createInstantSearch } from '../../../../test/mock/createInstantSearch';
import {
  createWidget,
  createInitOptions,
  createRenderOptions,
  createDisposeOptions,
} from '../../../../test/mock/createWidget';
import { runAllMicroTasks } from '../../../../test/utils/runAllMicroTasks';
import { Widget } from '../../../types';
import index from '../index';

describe('index', () => {
  const createSearchBox = (args: Partial<Widget> = {}): Widget =>
    createWidget({
      getConfiguration: jest.fn(() => {
        return new SearchParameters({
          query: 'Apple',
        });
      }),
      dispose: jest.fn(({ state }) => {
        return state.setQueryParameter('query', undefined);
      }),
      getWidgetState: jest.fn((uiState, { searchParameters }) => {
        if (!searchParameters.query) {
          return uiState;
        }

        return {
          ...uiState,
          query: searchParameters.query,
        };
      }),
      ...args,
    });

  const createPagination = (args: Partial<Widget> = {}): Widget =>
    createWidget({
      getConfiguration: jest.fn(() => {
        return new SearchParameters({
          page: 5,
        });
      }),
      dispose: jest.fn(({ state }) => {
        return state.setQueryParameter('page', undefined);
      }),
      getWidgetState: jest.fn((uiState, { searchParameters }) => {
        if (!searchParameters.page) {
          return uiState;
        }

        return {
          ...uiState,
          page: searchParameters.page,
        };
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

  it('is a widget', () => {
    const widget = index({ indexName: 'indexName' });

    expect(widget).toEqual(
      expect.objectContaining({
        $$type: 'ais.index',
        init: expect.any(Function),
        render: expect.any(Function),
        dispose: expect.any(Function),
      })
    );
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

        instance.init(
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

        instance.init(
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
          });
        });
      });

      it('schedules a search to take the added widgets into account', () => {
        const instance = index({ indexName: 'index_name' });
        const instantSearchInstance = createInstantSearch({
          scheduleSearch: jest.fn() as any,
        });

        instance.init(
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
          scheduleSearch: jest.fn() as any,
        });

        instance.init(
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

        instance.init(
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

        instance.init(
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
          scheduleSearch: jest.fn() as any,
        });

        const searchBox = createSearchBox();

        instance.addWidgets([searchBox, createPagination()]);

        instance.init(
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
          scheduleSearch: jest.fn() as any,
        });

        const searchBox = createSearchBox();

        instance.addWidgets([searchBox]);

        instance.init(
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
          scheduleSearch: jest.fn() as any,
        });

        const searchBox = createSearchBox();

        instance.addWidgets([searchBox]);

        instance.init(
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

      instance.init(
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

      instance.init(
        createInitOptions({
          instantSearchInstance,
        })
      );

      // Simulate a call to searchForFacetValues from a widget
      instance.getHelper()!.searchForFacetValues('brand', 'Apple', 10, {
        highlightPreTag: '<mark>',
        highlightPostTag: '</mark>',
      });

      expect(searchForFacetValues).toHaveBeenCalledTimes(1);
      expect(searchForFacetValues).toHaveBeenCalledWith(
        'brand',
        'Apple',
        10,
        expect.objectContaining({
          index: 'index_name',
          highlightPreTag: '<mark>',
          highlightPostTag: '</mark>',
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

      instance.init(
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

      subLevelInstance.init(
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

      instance.init(
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

    it('inherits from the parent states for the queries', () => {
      const level0 = index({ indexName: 'level_0_index_name' });
      const level1 = index({ indexName: 'level_1_index_name' });
      const level2 = index({ indexName: 'level_2_index_name' });
      const searchClient = createSearchClient();
      const mainHelper = algoliasearchHelper(searchClient, '', {});
      const instantSearchInstance = createInstantSearch({
        mainHelper,
      });

      level0.addWidgets([
        createWidget({
          getConfiguration() {
            return new SearchParameters({
              hitsPerPage: 5,
            });
          },
        }),

        createSearchBox({
          getConfiguration() {
            return new SearchParameters({
              query: 'Apple',
            });
          },
        }),

        createPagination({
          getConfiguration() {
            return new SearchParameters({
              page: 1,
            });
          },
        }),

        level1.addWidgets([
          createSearchBox({
            getConfiguration() {
              return new SearchParameters({
                query: 'Apple iPhone',
              });
            },
          }),

          createPagination({
            getConfiguration() {
              return new SearchParameters({
                page: 2,
              });
            },
          }),

          level2.addWidgets([
            createSearchBox({
              getConfiguration() {
                return new SearchParameters({
                  query: 'Apple iPhone XS',
                });
              },
            }),
          ]),
        ]),
      ]);

      level0.init(
        createInitOptions({
          instantSearchInstance,
        })
      );

      level0.getHelper()!.search();

      expect(searchClient.search).toHaveBeenCalledWith(
        expect.arrayContaining([
          {
            indexName: 'level_0_index_name',
            params: expect.objectContaining({
              hitsPerPage: 5,
              query: 'Apple',
              page: 1,
            }),
          },
          {
            indexName: 'level_1_index_name',
            params: expect.objectContaining({
              hitsPerPage: 5,
              query: 'Apple iPhone',
              page: 2,
            }),
          },
          {
            indexName: 'level_2_index_name',
            params: expect.objectContaining({
              hitsPerPage: 5,
              query: 'Apple iPhone XS',
              page: 2,
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

      instance.init(
        createInitOptions({
          instantSearchInstance,
        })
      );

      // Simulate a call to search from a widget
      instance.getHelper()!.searchForFacetValues('brand', 'Apple', 10, {
        highlightPreTag: '<mark>',
        highlightPostTag: '</mark>',
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
              highlightPreTag: '<mark>',
              highlightPostTag: '</mark>',
              page: 5,
            }),
          },
        ])
      );
    });

    it('schedules a render on DerivedHelper results', async () => {
      const instance = index({ indexName: 'index_name' });
      const instantSearchInstance = createInstantSearch({
        scheduleRender: jest.fn() as any,
      });

      instance.init(
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
      const instantSearchInstance = createInstantSearch({
        scheduleStalledRender: jest.fn() as any,
      });

      instance.init(
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

      instance.init(
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
        });
      });
    });

    it('updates the local `uiState` when the state changes', () => {
      const instance = index({ indexName: 'index_name' });
      const instantSearchInstance = createInstantSearch();
      const widgets = [createSearchBox(), createPagination()];

      instance.addWidgets(widgets);

      instance.init(
        createInitOptions({
          instantSearchInstance,
        })
      );

      // Simulate a state change
      instance
        .getHelper()!
        .setQueryParameter('query', 'Apple')
        .setQueryParameter('page', 5);

      expect(instance.getWidgetState({})).toEqual({
        // eslint-disable-next-line @typescript-eslint/camelcase
        index_name: {
          query: 'Apple',
          page: 5,
        },
      });
    });

    it('updates the local `uiState` only with widgets not indices', () => {
      const level0 = index({ indexName: 'level_0_index_name' });
      const level1 = index({ indexName: 'level_1_index_name' });
      const instantSearchInstance = createInstantSearch();
      const widgets = [createSearchBox(), createPagination()];

      jest.spyOn(level1, 'getWidgetState');

      level0.addWidgets([...widgets, level1]);

      level0.init(
        createInitOptions({
          instantSearchInstance,
        })
      );

      // Simulate a state change
      level0
        .getHelper()!
        .setQueryParameter('query', 'Apple')
        .setQueryParameter('page', 5);

      widgets.forEach(widget => {
        expect(widget.getWidgetState).toHaveBeenCalledTimes(2); // 2 changes
      });

      expect(level1.getWidgetState).toHaveBeenCalledTimes(0);
    });

    it('retrieves the `uiState` for the children indices', () => {
      const level0 = index({ indexName: 'level_0_index_name' });
      const level1 = index({ indexName: 'level_1_index_name' });
      const level2 = index({ indexName: 'level_2_index_name' });
      const level3 = index({ indexName: 'level_3_index_name' });
      const instantSearchInstance = createInstantSearch();

      level0.addWidgets([
        createSearchBox(),
        createPagination(),

        level1.addWidgets([
          createSearchBox(),
          createPagination(),

          level2.addWidgets([createSearchBox(), createPagination(), level3]),
        ]),
      ]);

      level0.init(
        createInitOptions({
          instantSearchInstance,
        })
      );

      // Simulate a state change
      level0
        .getHelper()!
        .setQueryParameter('query', 'Apple')
        .setQueryParameter('page', 5);

      level1
        .getHelper()!
        .setQueryParameter('query', 'Apple iPhone')
        .setQueryParameter('page', 7);

      level2
        .getHelper()!
        .setQueryParameter('query', 'Apple iPhone 5S')
        .setQueryParameter('page', 9);

      expect(level0.getWidgetState({})).toEqual({
        // eslint-disable-next-line @typescript-eslint/camelcase
        level_0_index_name: {
          query: 'Apple',
          page: 5,
        },
        // eslint-disable-next-line @typescript-eslint/camelcase
        level_1_index_name: {
          query: 'Apple iPhone',
          page: 7,
        },
        // eslint-disable-next-line @typescript-eslint/camelcase
        level_2_index_name: {
          query: 'Apple iPhone 5S',
          page: 9,
        },
        // eslint-disable-next-line @typescript-eslint/camelcase
        level_3_index_name: {},
      });

      expect(level1.getWidgetState({})).toEqual({
        // eslint-disable-next-line @typescript-eslint/camelcase
        level_1_index_name: {
          query: 'Apple iPhone',
          page: 7,
        },
        // eslint-disable-next-line @typescript-eslint/camelcase
        level_2_index_name: {
          query: 'Apple iPhone 5S',
          page: 9,
        },
        // eslint-disable-next-line @typescript-eslint/camelcase
        level_3_index_name: {},
      });

      expect(level2.getWidgetState({})).toEqual({
        // eslint-disable-next-line @typescript-eslint/camelcase
        level_2_index_name: {
          query: 'Apple iPhone 5S',
          page: 9,
        },
        // eslint-disable-next-line @typescript-eslint/camelcase
        level_3_index_name: {},
      });

      expect(level3.getWidgetState({})).toEqual({
        // eslint-disable-next-line @typescript-eslint/camelcase
        level_3_index_name: {},
      });
    });

    it('resets pages of nested indices when the state changes', () => {
      const level0 = index({ indexName: 'level_0_index_name' });
      const level1 = index({ indexName: 'level_1_index_name' });
      const level2 = index({ indexName: 'level_2_index_name' });
      const level3 = index({ indexName: 'level_3_index_name' });
      const searchClient = createSearchClient();
      const mainHelper = algoliasearchHelper(searchClient, '', {});
      const instantSearchInstance = createInstantSearch({
        mainHelper,
      });

      level0.addWidgets([
        createWidget({
          getConfiguration() {
            return new SearchParameters({
              hitsPerPage: 5,
            });
          },
        }),

        createSearchBox({
          getConfiguration() {
            return new SearchParameters({
              query: 'Apple',
            });
          },
        }),

        createPagination({
          getConfiguration() {
            return new SearchParameters({
              page: 1,
            });
          },
        }),

        level1.addWidgets([
          createSearchBox({
            getConfiguration() {
              return new SearchParameters({
                query: 'Apple iPhone',
              });
            },
          }),

          createPagination({
            getConfiguration() {
              return new SearchParameters({
                page: 2,
              });
            },
          }),

          level2.addWidgets([
            createSearchBox({
              getConfiguration() {
                return new SearchParameters({
                  query: 'Apple iPhone XS',
                });
              },
            }),

            createPagination({
              getConfiguration() {
                return new SearchParameters({
                  page: 3,
                });
              },
            }),

            level3.addWidgets([
              createSearchBox({
                getConfiguration() {
                  return new SearchParameters({
                    query: 'Apple iPhone XS Red',
                  });
                },
              }),

              createPagination({
                getConfiguration() {
                  return new SearchParameters({
                    page: 4,
                  });
                },
              }),
            ]),
          ]),
        ]),
      ]);

      level0.init(
        createInitOptions({
          instantSearchInstance,
        })
      );

      // Setting a query is considered as a change
      level1
        .getHelper()!
        .setQuery('Hey')
        .search();

      expect(searchClient.search).toHaveBeenCalledWith(
        expect.arrayContaining([
          {
            indexName: 'level_0_index_name',
            params: expect.objectContaining({
              hitsPerPage: 5,
              query: 'Apple',
              page: 1,
            }),
          },
          {
            indexName: 'level_1_index_name',
            params: expect.objectContaining({
              hitsPerPage: 5,
              query: 'Hey',
              page: 0,
            }),
          },
          {
            indexName: 'level_2_index_name',
            params: expect.objectContaining({
              hitsPerPage: 5,
              query: 'Apple iPhone XS',
              page: 0,
            }),
          },
          {
            indexName: 'level_3_index_name',
            params: expect.objectContaining({
              hitsPerPage: 5,
              query: 'Apple iPhone XS Red',
              page: 0,
            }),
          },
        ])
      );
    });

    it('does not reset pages of nested indices when only the page changes', () => {
      const level0 = index({ indexName: 'level_0_index_name' });
      const level1 = index({ indexName: 'level_1_index_name' });
      const level2 = index({ indexName: 'level_2_index_name' });
      const level3 = index({ indexName: 'level_3_index_name' });
      const searchClient = createSearchClient();
      const mainHelper = algoliasearchHelper(searchClient, '', {});
      const instantSearchInstance = createInstantSearch({
        mainHelper,
      });

      level0.addWidgets([
        createWidget({
          getConfiguration() {
            return new SearchParameters({
              hitsPerPage: 5,
            });
          },
        }),

        createSearchBox({
          getConfiguration() {
            return new SearchParameters({
              query: 'Apple',
            });
          },
        }),

        createPagination({
          getConfiguration() {
            return new SearchParameters({
              page: 1,
            });
          },
        }),

        level1.addWidgets([
          createSearchBox({
            getConfiguration() {
              return new SearchParameters({
                query: 'Apple iPhone',
              });
            },
          }),

          createPagination({
            getConfiguration() {
              return new SearchParameters({
                page: 2,
              });
            },
          }),

          level2.addWidgets([
            createSearchBox({
              getConfiguration() {
                return new SearchParameters({
                  query: 'Apple iPhone XS',
                });
              },
            }),

            createPagination({
              getConfiguration() {
                return new SearchParameters({
                  page: 3,
                });
              },
            }),

            level3.addWidgets([
              createSearchBox({
                getConfiguration() {
                  return new SearchParameters({
                    query: 'Apple iPhone XS Red',
                  });
                },
              }),

              createPagination({
                getConfiguration() {
                  return new SearchParameters({
                    page: 4,
                  });
                },
              }),
            ]),
          ]),
        ]),
      ]);

      level0.init(
        createInitOptions({
          instantSearchInstance,
        })
      );

      level1
        .getHelper()!
        .setPage(4)
        .search();

      expect(searchClient.search).toHaveBeenCalledWith(
        expect.arrayContaining([
          {
            indexName: 'level_0_index_name',
            params: expect.objectContaining({
              hitsPerPage: 5,
              query: 'Apple',
              page: 1,
            }),
          },
          {
            indexName: 'level_1_index_name',
            params: expect.objectContaining({
              hitsPerPage: 5,
              query: 'Apple iPhone',
              page: 4,
            }),
          },
          {
            indexName: 'level_2_index_name',
            params: expect.objectContaining({
              hitsPerPage: 5,
              query: 'Apple iPhone XS',
              page: 3,
            }),
          },
          {
            indexName: 'level_3_index_name',
            params: expect.objectContaining({
              hitsPerPage: 5,
              query: 'Apple iPhone XS Red',
              page: 4,
            }),
          },
        ])
      );
    });

    it('is a noop for unset pages of nested indices when the state changes', () => {
      const level0 = index({ indexName: 'level_0_index_name' });
      const level1 = index({ indexName: 'level_1_index_name' });
      const level2 = index({ indexName: 'level_2_index_name' });
      const level3 = index({ indexName: 'level_3_index_name' });
      const searchClient = createSearchClient();
      const mainHelper = algoliasearchHelper(searchClient, '', {});
      const instantSearchInstance = createInstantSearch({
        mainHelper,
      });

      level0.addWidgets([
        createWidget({
          getConfiguration() {
            return new SearchParameters({
              hitsPerPage: 5,
            });
          },
        }),

        createSearchBox({
          getConfiguration() {
            return new SearchParameters({
              query: 'Apple',
            });
          },
        }),

        createPagination({
          getConfiguration() {
            return new SearchParameters({
              page: 1,
            });
          },
        }),

        level1.addWidgets([
          createSearchBox({
            getConfiguration() {
              return new SearchParameters({
                query: 'Apple iPhone',
              });
            },
          }),

          createPagination({
            getConfiguration() {
              return new SearchParameters({
                page: 2,
              });
            },
          }),

          level2.addWidgets([
            createSearchBox({
              getConfiguration() {
                return new SearchParameters({
                  query: 'Apple iPhone XS',
                });
              },
            }),

            level3.addWidgets([
              createSearchBox({
                getConfiguration() {
                  return new SearchParameters({
                    query: 'Apple iPhone XS Red',
                  });
                },
              }),
            ]),
          ]),
        ]),
      ]);

      level0.init(
        createInitOptions({
          instantSearchInstance,
        })
      );

      level1
        .getHelper()!
        .setQuery('Hey')
        .search();

      expect(searchClient.search).toHaveBeenCalledWith(
        expect.arrayContaining([
          {
            indexName: 'level_0_index_name',
            params: expect.objectContaining({
              hitsPerPage: 5,
              query: 'Apple',
              page: 1,
            }),
          },
          {
            indexName: 'level_1_index_name',
            params: expect.objectContaining({
              hitsPerPage: 5,
              query: 'Hey',
              page: 0,
            }),
          },
          {
            indexName: 'level_2_index_name',
            params: expect.objectContaining({
              hitsPerPage: 5,
              query: 'Apple iPhone XS',
              page: 0,
            }),
          },
          {
            indexName: 'level_3_index_name',
            params: expect.objectContaining({
              hitsPerPage: 5,
              query: 'Apple iPhone XS Red',
              page: 0,
            }),
          },
        ])
      );
    });
  });

  describe('render', () => {
    it('calls `render` on its widgets', async () => {
      const instance = index({ indexName: 'index_name' });
      const instantSearchInstance = createInstantSearch();

      const widgets = [createSearchBox(), createPagination()];

      instance.addWidgets(widgets);

      widgets.forEach(widget => {
        expect(widget.render).toHaveBeenCalledTimes(0);
      });

      instance.init(
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

      instance.render(
        createRenderOptions({
          instantSearchInstance,
        })
      );

      widgets.forEach(widget => {
        expect(widget.render).toHaveBeenCalledTimes(1);
        expect(widget.render).toHaveBeenCalledWith({
          instantSearchInstance,
          results: expect.any(algoliasearchHelper.SearchResults),
          scopedResults: [
            {
              indexId: 'index_name',
              results: (widget.render as jest.Mock).mock.calls[0][0].results,
            },
          ],
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

    // https://github.com/algolia/instantsearch.js/pull/2623
    it('does not call `render` without `lastResults`', () => {
      const instance = index({ indexName: 'index_name' });
      const instantSearchInstance = createInstantSearch();

      const widgets = [createSearchBox(), createPagination()];

      instance.addWidgets(widgets);

      widgets.forEach(widget => {
        expect(widget.render).toHaveBeenCalledTimes(0);
      });

      instance.init(
        createInitOptions({
          instantSearchInstance,
        })
      );

      widgets.forEach(widget => {
        expect(widget.render).toHaveBeenCalledTimes(0);
      });

      instance.render(
        createRenderOptions({
          instantSearchInstance,
        })
      );

      widgets.forEach(widget => {
        expect(widget.render).toHaveBeenCalledTimes(0);
      });
    });

    it('calls `render` with `scopedResults` coming from siblings and children', async () => {
      /* eslint-disable @typescript-eslint/camelcase */
      const level0 = index({ indexName: 'level0_index_name' });
      const level1 = index({ indexName: 'level1_index_name' });
      const level2 = index({ indexName: 'level2_index_name' });
      const level2_1 = index({ indexName: 'level2_1_index_name' });
      const level2_2 = index({ indexName: 'level2_2_index_name' });
      const level2_2_1 = index({ indexName: 'level2_2_1_index_name' });
      const level3 = index({ indexName: 'level3_index_name' });
      const instantSearchInstance = createInstantSearch();
      const searchBoxLevel0 = createSearchBox();
      const searchBoxLevel1 = createSearchBox();
      const seachBoxLevel2_1 = createSearchBox();

      level0.addWidgets([
        searchBoxLevel0,
        level1.addWidgets([searchBoxLevel1]),
        level2.addWidgets([
          createSearchBox(),
          level2_1.addWidgets([seachBoxLevel2_1]),
          level2_2.addWidgets([
            createSearchBox(),
            level2_2_1.addWidgets([createSearchBox()]),
          ]),
        ]),
        level3.addWidgets([createSearchBox()]),
      ]);

      level0.init(
        createInitOptions({
          instantSearchInstance,
        })
      );

      // Simulate a call to search from a widget - this step is required otherwise
      // the DerivedHelper does not contain the results. The `lastResults` attribute
      // is set once the `result` event is emitted.
      level0.getHelper()!.search();

      await runAllMicroTasks();

      level0.render(
        createRenderOptions({
          instantSearchInstance,
        })
      );

      // First-level child index
      expect(searchBoxLevel1.render).toHaveBeenCalledTimes(1);
      expect(searchBoxLevel1.render).toHaveBeenCalledWith(
        expect.objectContaining({
          scopedResults: [
            // Root index
            {
              indexId: 'level1_index_name',
              results: (searchBoxLevel1.render as jest.Mock).mock.calls[0][0]
                .results,
            },
            // Siblings and children
            {
              indexId: 'level2_index_name',
              results: expect.any(algoliasearchHelper.SearchResults),
            },
            {
              indexId: 'level2_1_index_name',
              results: expect.any(algoliasearchHelper.SearchResults),
            },
            {
              indexId: 'level2_2_index_name',
              results: expect.any(algoliasearchHelper.SearchResults),
            },
            {
              indexId: 'level2_2_1_index_name',
              results: expect.any(algoliasearchHelper.SearchResults),
            },
            {
              indexId: 'level3_index_name',
              results: expect.any(algoliasearchHelper.SearchResults),
            },
          ],
        })
      );

      // Sibling index
      expect(seachBoxLevel2_1.render).toHaveBeenCalledTimes(1);
      expect(seachBoxLevel2_1.render).toHaveBeenCalledWith(
        expect.objectContaining({
          scopedResults: [
            // Root index
            {
              indexId: 'level2_1_index_name',
              results: (seachBoxLevel2_1.render as jest.Mock).mock.calls[0][0]
                .results,
            },
            // Siblings and children
            {
              indexId: 'level2_2_index_name',
              results: expect.any(algoliasearchHelper.SearchResults),
            },
            {
              indexId: 'level2_2_1_index_name',
              results: expect.any(algoliasearchHelper.SearchResults),
            },
          ],
        })
      );

      // Top-level index
      expect(searchBoxLevel0.render).toHaveBeenCalledTimes(1);
      expect(searchBoxLevel0.render).toHaveBeenCalledWith(
        expect.objectContaining({
          scopedResults: [
            // Root index
            {
              indexId: 'level0_index_name',
              results: (searchBoxLevel0.render as jest.Mock).mock.calls[0][0]
                .results,
            },
            // Siblings and children
            {
              indexId: 'level1_index_name',
              results: (searchBoxLevel1.render as jest.Mock).mock.calls[0][0]
                .results,
            },
            {
              indexId: 'level2_index_name',
              results: expect.any(algoliasearchHelper.SearchResults),
            },
            {
              indexId: 'level2_1_index_name',
              results: expect.any(algoliasearchHelper.SearchResults),
            },
            {
              indexId: 'level2_2_index_name',
              results: expect.any(algoliasearchHelper.SearchResults),
            },
            {
              indexId: 'level2_2_1_index_name',
              results: expect.any(algoliasearchHelper.SearchResults),
            },
            {
              indexId: 'level3_index_name',
              results: expect.any(algoliasearchHelper.SearchResults),
            },
          ],
        })
      );

      /* eslint-enable @typescript-eslint/camelcase */
    });
  });

  describe('dispose', () => {
    it('calls `dispose` on its widgets', () => {
      const instance = index({ indexName: 'index_name' });
      const instantSearchInstance = createInstantSearch();
      const widgets = [createSearchBox(), createPagination()];

      instance.addWidgets(widgets);

      instance.init(
        createInitOptions({
          instantSearchInstance,
        })
      );

      widgets.forEach(widget => {
        expect(widget.dispose).toHaveBeenCalledTimes(0);
      });

      // Save the Helper to be able to simulate the search
      const helper = instance.getHelper();

      instance.dispose(
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

      instance.init(
        createInitOptions({
          instantSearchInstance,
        })
      );

      expect(instance.getWidgets()).toHaveLength(2);

      instance.dispose(createDisposeOptions());

      expect(instance.getWidgets()).toHaveLength(2);
    });

    it('removes the internal parent', () => {
      const topLevelInstance = index({ indexName: 'top_level_index_name' });
      const subLevelInstance = index({ indexName: 'sub_level_index_name' });
      const instantSearchInstance = createInstantSearch();

      topLevelInstance.addWidgets([subLevelInstance]);

      topLevelInstance.init(
        createInitOptions({
          instantSearchInstance,
        })
      );

      expect(subLevelInstance.getHelper()).toBeDefined();

      subLevelInstance.dispose(createDisposeOptions());

      expect(subLevelInstance.getHelper()).toBe(null);
    });

    it('removes the listeners on internal Helper', () => {
      const instance = index({ indexName: 'index_name' });
      const instantSearchInstance = createInstantSearch();
      const searchBox = createSearchBox();

      instance.addWidgets([searchBox]);

      instance.init(
        createInitOptions({
          instantSearchInstance,
        })
      );

      // Save the Helper to be able to simulate a change
      const helper = instance.getHelper()!;

      // Simuate a state change
      helper.setQueryParameter('query', 'Apple iPhone');

      expect(searchBox.getWidgetState).toHaveBeenCalledTimes(1);

      instance.dispose(createDisposeOptions());

      // Simuate a state change
      helper.setQueryParameter('query', 'Apple iPhone 5S');

      expect(searchBox.getWidgetState).toHaveBeenCalledTimes(1);
    });

    it('removes the internal Helper', () => {
      const instance = index({ indexName: 'index_name' });
      const instantSearchInstance = createInstantSearch();

      instance.init(
        createInitOptions({
          instantSearchInstance,
        })
      );

      expect(instance.getHelper()).toBeDefined();

      instance.dispose(createDisposeOptions());

      expect(instance.getHelper()).toBe(null);
    });

    it('removes the listeners on DerivedHelper', async () => {
      const instance = index({ indexName: 'index_name' });
      const instantSearchInstance = createInstantSearch({
        scheduleRender: jest.fn() as any,
      });

      instance.init(
        createInitOptions({
          instantSearchInstance,
        })
      );

      // Save the Helper to be able to simulate the search
      const helper = instance.getHelper();

      instance.dispose(createDisposeOptions());

      // Simulate a call to search from a widget
      helper!.search();

      expect(instantSearchInstance.scheduleRender).toHaveBeenCalledTimes(0);

      await runAllMicroTasks();

      expect(instantSearchInstance.scheduleRender).toHaveBeenCalledTimes(0);
    });

    it('removes the DerivedHelper', () => {
      const instance = index({ indexName: 'index_name' });
      const searchClient = createSearchClient();
      const mainHelper = algoliasearchHelper(searchClient, '', {});
      const instantSearchInstance = createInstantSearch({
        mainHelper,
      });

      instance.init(
        createInitOptions({
          instantSearchInstance,
        })
      );

      expect(mainHelper.derivedHelpers).toHaveLength(1);

      instance.dispose(createDisposeOptions());

      expect(mainHelper.derivedHelpers).toHaveLength(0);
    });
  });
});
