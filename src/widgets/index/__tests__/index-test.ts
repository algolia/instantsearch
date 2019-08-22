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
      getWidgetSearchParameters: jest.fn((searchParameters, { uiState }) => {
        return searchParameters.setQueryParameter(
          'query',
          uiState.query || 'Apple'
        );
      }),
      ...args,
    });

  const createPagination = (args: Partial<Widget> = {}): Widget =>
    createWidget({
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
      getWidgetSearchParameters: jest.fn((searchParameters, { uiState }) => {
        return searchParameters.setQueryParameter('page', uiState.page || 5);
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
      const instance = index({ indexName: 'indexName' });

      expect(instance.getWidgets()).toHaveLength(0);

      instance.addWidgets([createSearchBox(), createPagination()]);

      expect(instance.getWidgets()).toHaveLength(2);
    });

    it('returns the instance to be able to chain the calls', () => {
      const topLevelIndex = index({ indexName: 'topLevelIndexName' });
      const subLevelIndex = index({ indexName: 'subLevelIndexName' });

      topLevelIndex.addWidgets([
        subLevelIndex.addWidgets([createSearchBox(), createPagination()]),
      ]);

      expect(topLevelIndex.getWidgets()).toHaveLength(1);
      expect(topLevelIndex.getWidgets()).toEqual([subLevelIndex]);
    });

    it('does not throw an error without the `init` step', () => {
      const topLevelIndex = index({ indexName: 'topLevelIndexName' });
      const subLevelIndex = index({ indexName: 'subLevelIndexName' });

      expect(() => topLevelIndex.addWidgets([subLevelIndex])).not.toThrow();
    });

    it('throws an error with a value different than `array`', () => {
      const instance = index({ indexName: 'indexName' });

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
      const instance = index({ indexName: 'indexName' });

      expect(() => {
        instance.addWidgets([{ dummy: true } as any]);
      }).toThrowErrorMatchingInlineSnapshot(`
"The widget definition expects a \`render\` and/or an \`init\` method.

See documentation: https://www.algolia.com/doc/api-reference/widgets/index/js/"
`);
    });

    describe('with a started instance', () => {
      it('updates the internal state with added widgets', () => {
        const instance = index({ indexName: 'indexName' });

        instance.addWidgets([createSearchBox()]);

        instance.init(createInitOptions());

        expect(instance.getHelper()!.state).toEqual(
          new SearchParameters({
            index: 'indexName',
            query: 'Apple',
          })
        );

        instance.addWidgets([createPagination()]);

        expect(instance.getHelper()!.state).toEqual(
          new SearchParameters({
            index: 'indexName',
            query: 'Apple',
            page: 5,
          })
        );
      });

      it('calls `init` on the added widgets', () => {
        const instance = index({ indexName: 'indexName' });
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
        const instance = index({ indexName: 'indexName' });
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
        const instance = index({ indexName: 'indexName' });
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
      const instance = index({ indexName: 'indexName' });
      const searchBox = createSearchBox();
      const pagination = createPagination();

      instance.addWidgets([searchBox, pagination]);

      expect(instance.getWidgets()).toHaveLength(2);

      instance.removeWidgets([pagination]);

      expect(instance.getWidgets()).toEqual([searchBox]);
    });

    it('removes given widgets from the instance', () => {
      const instance = index({ indexName: 'indexName' });
      const searchBox = createSearchBox();
      const pagination = createPagination();

      instance.addWidgets([searchBox, pagination]);

      expect(instance.getWidgets()).toHaveLength(2);

      instance.removeWidgets([searchBox, pagination]);

      expect(instance.getWidgets()).toHaveLength(0);
    });

    it('returns the instance to be able to chain the calls', () => {
      const topLevelInstance = index({ indexName: 'topLevelIndexName' });
      const subLevelInstance = index({ indexName: 'subLevelIndexName' });
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
      const topLevelInstance = index({ indexName: 'topLevelIndexName' });
      const subLevelIndex = index({ indexName: 'subLevelIndexName' });

      topLevelInstance.addWidgets([subLevelIndex]);

      expect(() =>
        topLevelInstance.removeWidgets([subLevelIndex])
      ).not.toThrow();
    });

    it('throws an error with a value different than `array`', () => {
      const instance = index({ indexName: 'indexName' });

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
      const instance = index({ indexName: 'indexName' });

      expect(() => {
        instance.removeWidgets([{ dummy: true } as any]);
      }).toThrowErrorMatchingInlineSnapshot(`
"The widget definition expects a \`dispose\` method.

See documentation: https://www.algolia.com/doc/api-reference/widgets/index/js/"
`);
    });

    describe('with a started instance', () => {
      it('updates the internal state with removed widgets', () => {
        const instance = index({ indexName: 'indexName' });
        const pagination = createPagination();

        instance.addWidgets([createSearchBox(), pagination]);

        instance.init(createInitOptions());

        expect(instance.getHelper()!.state).toEqual(
          new SearchParameters({
            index: 'indexName',
            query: 'Apple',
            page: 5,
          })
        );

        instance.removeWidgets([pagination]);

        expect(instance.getHelper()!.state).toEqual(
          new SearchParameters({
            index: 'indexName',
            query: 'Apple',
          })
        );
      });

      it('calls `dispose` on the removed widgets', () => {
        const instance = index({ indexName: 'indexName' });
        const widgets = [
          createSearchBox({
            dispose: jest.fn(),
          }),
          createPagination({
            dispose: jest.fn(),
          }),
        ];

        instance.addWidgets(widgets);

        instance.init(createInitOptions());

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
        const instance = index({ indexName: 'indexName' });
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
        const instance = index({ indexName: 'indexName' });
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
        const instance = index({ indexName: 'indexName' });
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
      const instance = index({ indexName: 'indexName' });
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
      const instance = index({ indexName: 'indexName' });
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
          index: 'indexName',
          highlightPreTag: '<mark>',
          highlightPostTag: '</mark>',
        })
      );
    });

    it('uses `searchParameters` for the top level index', () => {
      const instance = index({ indexName: 'indexName' });
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
        new SearchParameters({
          index: 'indexName',
          hitsPerPage: 5,
          disjunctiveFacetsRefinements: { brand: ['Apple'] },
          disjunctiveFacets: ['brand'],
        })
      );
    });

    it('does not use `searchParameters` for sub level indices ', () => {
      const topLevelInstance = index({ indexName: 'topLevelIndexName' });
      const subLevelInstance = index({ indexName: 'subLevelIndexName' });
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
        new SearchParameters({
          index: 'subLevelIndexName',
        })
      );
    });

    it('uses the internal state for the queries', () => {
      const instance = index({ indexName: 'indexName' });
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
            indexName: 'indexName',
            params: expect.objectContaining({
              query: 'Apple',
              page: 5,
            }),
          },
        ])
      );
    });

    it('inherits from the parent states for the queries', () => {
      const level0 = index({ indexName: 'level0IndexName' });
      const level1 = index({ indexName: 'level1IndexName' });
      const level2 = index({ indexName: 'level2IndexName' });
      const searchClient = createSearchClient();
      const mainHelper = algoliasearchHelper(searchClient, '', {});
      const instantSearchInstance = createInstantSearch({
        mainHelper,
      });

      level0.addWidgets([
        createWidget({
          getWidgetSearchParameters(searchParameters) {
            return searchParameters.setQueryParameter('hitsPerPage', 5);
          },
        }),

        createSearchBox({
          getWidgetSearchParameters(searchParameters) {
            return searchParameters.setQueryParameter('query', 'Apple');
          },
        }),

        createPagination({
          getWidgetSearchParameters(searchParameters) {
            return searchParameters.setQueryParameter('page', 1);
          },
        }),

        level1.addWidgets([
          createSearchBox({
            getWidgetSearchParameters(searchParameters) {
              return searchParameters.setQueryParameter(
                'query',
                'Apple iPhone'
              );
            },
          }),

          createPagination({
            getWidgetSearchParameters(searchParameters) {
              return searchParameters.setQueryParameter('page', 2);
            },
          }),

          level2.addWidgets([
            createSearchBox({
              getWidgetSearchParameters(searchParameters) {
                return searchParameters.setQueryParameter(
                  'query',
                  'Apple iPhone XS'
                );
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
            indexName: 'level0IndexName',
            params: expect.objectContaining({
              hitsPerPage: 5,
              query: 'Apple',
              page: 1,
            }),
          },
          {
            indexName: 'level1IndexName',
            params: expect.objectContaining({
              hitsPerPage: 5,
              query: 'Apple iPhone',
              page: 2,
            }),
          },
          {
            indexName: 'level2IndexName',
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
      const instance = index({ indexName: 'indexName' });
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
            indexName: 'indexName',
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
      const instance = index({ indexName: 'indexName' });
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
      const instance = index({ indexName: 'indexName' });
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
      const instance = index({ indexName: 'indexName' });
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

    describe('with page reset', () => {
      it('resets pages of nested indices when the state changes', () => {
        const level0 = index({ indexName: 'level0IndexName' });
        const level1 = index({ indexName: 'level1IndexName' });
        const level2 = index({ indexName: 'level2IndexName' });
        const level3 = index({ indexName: 'level3IndexName' });
        const searchClient = createSearchClient();
        const mainHelper = algoliasearchHelper(searchClient, '', {});
        const instantSearchInstance = createInstantSearch({
          mainHelper,
        });

        level0.addWidgets([
          createWidget({
            getWidgetSearchParameters(searchParameters) {
              return searchParameters.setQueryParameter('hitsPerPage', 5);
            },
          }),

          createSearchBox({
            getWidgetSearchParameters(searchParameters) {
              return searchParameters.setQueryParameter('query', 'Apple');
            },
          }),

          createPagination({
            getWidgetSearchParameters(searchParameters) {
              return searchParameters.setQueryParameter('page', 1);
            },
          }),

          level1.addWidgets([
            createSearchBox({
              getWidgetSearchParameters(searchParameters) {
                return searchParameters.setQueryParameter(
                  'query',
                  'Apple iPhone'
                );
              },
            }),

            createPagination({
              getWidgetSearchParameters(searchParameters) {
                return searchParameters.setQueryParameter('page', 2);
              },
            }),

            level2.addWidgets([
              createSearchBox({
                getWidgetSearchParameters(searchParameters) {
                  return searchParameters.setQueryParameter(
                    'query',
                    'Apple iPhone XS'
                  );
                },
              }),

              createPagination({
                getWidgetSearchParameters(searchParameters) {
                  return searchParameters.setQueryParameter('page', 3);
                },
              }),

              level3.addWidgets([
                createSearchBox({
                  getWidgetSearchParameters(searchParameters) {
                    return searchParameters.setQueryParameter(
                      'query',
                      'Apple iPhone XS Red'
                    );
                  },
                }),

                createPagination({
                  getWidgetSearchParameters(searchParameters) {
                    return searchParameters.setQueryParameter('page', 4);
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
              indexName: 'level0IndexName',
              params: expect.objectContaining({
                hitsPerPage: 5,
                query: 'Apple',
                page: 1,
              }),
            },
            {
              indexName: 'level1IndexName',
              params: expect.objectContaining({
                hitsPerPage: 5,
                query: 'Hey',
                page: 0,
              }),
            },
            {
              indexName: 'level2IndexName',
              params: expect.objectContaining({
                hitsPerPage: 5,
                query: 'Apple iPhone XS',
                page: 0,
              }),
            },
            {
              indexName: 'level3IndexName',
              params: expect.objectContaining({
                hitsPerPage: 5,
                query: 'Apple iPhone XS Red',
                page: 0,
              }),
            },
          ])
        );
      });

      it('resets pages of nested indices triggers an `uiState` change', () => {
        const level0 = index({ indexName: 'level0IndexName' });
        const level1 = index({ indexName: 'level1IndexName' });
        const level2 = index({ indexName: 'level2IndexName' });
        const level3 = index({ indexName: 'level3IndexName' });

        level0.addWidgets([
          createSearchBox(),
          createPagination(),

          level1.addWidgets([
            createSearchBox(),
            createPagination(),

            level2.addWidgets([
              createSearchBox(),
              createPagination(),

              level3.addWidgets([createSearchBox(), createPagination()]),
            ]),
          ]),
        ]);

        level0.init(createInitOptions());

        level0
          .getHelper()!
          .setQueryParameter('query', 'Apple')
          .setQueryParameter('page', 1);

        level1
          .getHelper()!
          .setQueryParameter('query', 'Apple iPhone')
          .setQueryParameter('page', 2);

        level2
          .getHelper()!
          .setQueryParameter('query', 'Apple iPhone XS')
          .setQueryParameter('page', 3);

        level3
          .getHelper()!
          .setQueryParameter('query', 'Apple iPhone XS Red')
          .setQueryParameter('page', 4);

        expect(level0.getWidgetState({})).toEqual({
          level0IndexName: {
            query: 'Apple',
            page: 1,
          },
          level1IndexName: {
            query: 'Apple iPhone',
            page: 2,
          },
          level2IndexName: {
            query: 'Apple iPhone XS',
            page: 3,
          },
          level3IndexName: {
            query: 'Apple iPhone XS Red',
            page: 4,
          },
        });

        // Setting a query is considered as a change
        level0
          .getHelper()!
          .setQuery('Hey')
          .search();

        expect(level0.getWidgetState({})).toEqual({
          level0IndexName: {
            query: 'Hey',
          },
          level1IndexName: {
            query: 'Apple iPhone',
          },
          level2IndexName: {
            query: 'Apple iPhone XS',
          },
          level3IndexName: {
            query: 'Apple iPhone XS Red',
          },
        });
      });

      it('does not reset pages of nested indices when only the page changes', () => {
        const level0 = index({ indexName: 'level0IndexName' });
        const level1 = index({ indexName: 'level1IndexName' });
        const level2 = index({ indexName: 'level2IndexName' });
        const level3 = index({ indexName: 'level3IndexName' });
        const searchClient = createSearchClient();
        const mainHelper = algoliasearchHelper(searchClient, '', {});
        const instantSearchInstance = createInstantSearch({
          mainHelper,
        });

        level0.addWidgets([
          createWidget({
            getWidgetSearchParameters(searchParameters) {
              return searchParameters.setQueryParameter('hitsPerPage', 5);
            },
          }),

          createSearchBox({
            getWidgetSearchParameters(searchParameters) {
              return searchParameters.setQueryParameter('query', 'Apple');
            },
          }),

          createPagination({
            getWidgetSearchParameters(searchParameters) {
              return searchParameters.setQueryParameter('page', 1);
            },
          }),

          level1.addWidgets([
            createSearchBox({
              getWidgetSearchParameters(searchParameters) {
                return searchParameters.setQueryParameter(
                  'query',
                  'Apple iPhone'
                );
              },
            }),

            createPagination({
              getWidgetSearchParameters(searchParameters) {
                return searchParameters.setQueryParameter('page', 2);
              },
            }),

            level2.addWidgets([
              createSearchBox({
                getWidgetSearchParameters(searchParameters) {
                  return searchParameters.setQueryParameter(
                    'query',
                    'Apple iPhone XS'
                  );
                },
              }),

              createPagination({
                getWidgetSearchParameters(searchParameters) {
                  return searchParameters.setQueryParameter('page', 3);
                },
              }),

              level3.addWidgets([
                createSearchBox({
                  getWidgetSearchParameters(searchParameters) {
                    return searchParameters.setQueryParameter(
                      'query',
                      'Apple iPhone XS Red'
                    );
                  },
                }),

                createPagination({
                  getWidgetSearchParameters(searchParameters) {
                    return searchParameters.setQueryParameter('page', 4);
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
              indexName: 'level0IndexName',
              params: expect.objectContaining({
                hitsPerPage: 5,
                query: 'Apple',
                page: 1,
              }),
            },
            {
              indexName: 'level1IndexName',
              params: expect.objectContaining({
                hitsPerPage: 5,
                query: 'Apple iPhone',
                page: 4,
              }),
            },
            {
              indexName: 'level2IndexName',
              params: expect.objectContaining({
                hitsPerPage: 5,
                query: 'Apple iPhone XS',
                page: 3,
              }),
            },
            {
              indexName: 'level3IndexName',
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
        const level0 = index({ indexName: 'level0IndexName' });
        const level1 = index({ indexName: 'level1IndexName' });
        const level2 = index({ indexName: 'level2IndexName' });
        const level3 = index({ indexName: 'level3IndexName' });
        const searchClient = createSearchClient();
        const mainHelper = algoliasearchHelper(searchClient, '', {});
        const instantSearchInstance = createInstantSearch({
          mainHelper,
        });

        level0.addWidgets([
          createWidget({
            getWidgetSearchParameters(searchParameters) {
              return searchParameters.setQueryParameter('hitsPerPage', 5);
            },
          }),

          createSearchBox({
            getWidgetSearchParameters(searchParameters) {
              return searchParameters.setQueryParameter('query', 'Apple');
            },
          }),

          createPagination({
            getWidgetSearchParameters(searchParameters) {
              return searchParameters.setQueryParameter('page', 1);
            },
          }),

          level1.addWidgets([
            createSearchBox({
              getWidgetSearchParameters(searchParameters) {
                return searchParameters.setQueryParameter(
                  'query',
                  'Apple iPhone'
                );
              },
            }),

            createPagination({
              getWidgetSearchParameters(searchParameters) {
                return searchParameters.setQueryParameter('page', 2);
              },
            }),

            level2.addWidgets([
              createSearchBox({
                getWidgetSearchParameters(searchParameters) {
                  return searchParameters.setQueryParameter(
                    'query',
                    'Apple iPhone XS'
                  );
                },
              }),

              level3.addWidgets([
                createSearchBox({
                  getWidgetSearchParameters(searchParameters) {
                    return searchParameters.setQueryParameter(
                      'query',
                      'Apple iPhone XS Red'
                    );
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
              indexName: 'level0IndexName',
              params: expect.objectContaining({
                hitsPerPage: 5,
                query: 'Apple',
                page: 1,
              }),
            },
            {
              indexName: 'level1IndexName',
              params: expect.objectContaining({
                hitsPerPage: 5,
                query: 'Hey',
                page: 0,
              }),
            },
            {
              indexName: 'level2IndexName',
              params: expect.objectContaining({
                hitsPerPage: 5,
                query: 'Apple iPhone XS',
                page: 0,
              }),
            },
            {
              indexName: 'level3IndexName',
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

    describe('with uiState', () => {
      it('updates the local `uiState` when the state changes', () => {
        const instance = index({ indexName: 'indexName' });
        const widgets = [createSearchBox(), createPagination()];

        instance.addWidgets(widgets);

        instance.init(createInitOptions());

        // Simulate a state change
        instance
          .getHelper()!
          .setQueryParameter('query', 'Apple')
          .setQueryParameter('page', 5);

        expect(instance.getWidgetState({})).toEqual({
          indexName: {
            query: 'Apple',
            page: 5,
          },
        });
      });

      it('uses `indexId` for scope key', () => {
        const instance = index({ indexName: 'indexName', indexId: 'indexId' });
        const widgets = [createSearchBox(), createPagination()];

        instance.addWidgets(widgets);

        instance.init(createInitOptions());

        // Simulate a state change
        instance
          .getHelper()!
          .setQueryParameter('query', 'Apple')
          .setQueryParameter('page', 5);

        expect(instance.getWidgetState({})).toEqual({
          indexId: {
            query: 'Apple',
            page: 5,
          },
        });
      });

      it('does not update the local `uiState` on state changes in `init`', () => {
        const instance = index({ indexName: 'indexName' });
        const widgets = [
          createSearchBox(),
          createPagination(),
          createWidget({
            init({ helper }) {
              helper
                .setQueryParameter('query', 'Apple iPhone')
                .setQueryParameter('page', 5);
            },
          }),
        ];

        instance.addWidgets(widgets);

        instance.init(createInitOptions());

        expect(instance.getHelper()!.state).toEqual(
          new SearchParameters({
            index: 'indexName',
            query: 'Apple iPhone',
            page: 5,
          })
        );

        expect(instance.getWidgetState({})).toEqual({
          indexName: {},
        });
      });

      it('updates the local `uiState` only with widgets not indices', () => {
        const level0 = index({ indexName: 'level0IndexName' });
        const level1 = index({ indexName: 'level1IndexName' });
        const widgets = [createSearchBox(), createPagination()];

        jest.spyOn(level1, 'getWidgetState');

        level0.addWidgets([...widgets, level1]);

        level0.init(createInitOptions());

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
        const level0 = index({ indexName: 'level0IndexName' });
        const level1 = index({ indexName: 'level1IndexName' });
        const level2 = index({ indexName: 'level2IndexName' });
        const level3 = index({ indexName: 'level3IndexName' });

        level0.addWidgets([
          createSearchBox(),
          createPagination(),

          level1.addWidgets([
            createSearchBox(),
            createPagination(),

            level2.addWidgets([createSearchBox(), createPagination(), level3]),
          ]),
        ]);

        level0.init(createInitOptions());

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
          level0IndexName: {
            query: 'Apple',
            page: 5,
          },
          level1IndexName: {
            query: 'Apple iPhone',
            page: 7,
          },
          level2IndexName: {
            query: 'Apple iPhone 5S',
            page: 9,
          },
          level3IndexName: {},
        });

        expect(level1.getWidgetState({})).toEqual({
          level1IndexName: {
            query: 'Apple iPhone',
            page: 7,
          },
          level2IndexName: {
            query: 'Apple iPhone 5S',
            page: 9,
          },
          level3IndexName: {},
        });

        expect(level2.getWidgetState({})).toEqual({
          level2IndexName: {
            query: 'Apple iPhone 5S',
            page: 9,
          },
          level3IndexName: {},
        });

        expect(level3.getWidgetState({})).toEqual({
          level3IndexName: {},
        });
      });
    });
  });

  describe('render', () => {
    it('calls `render` on its widgets', async () => {
      const instance = index({ indexName: 'indexName' });
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
              indexId: 'indexName',
              results: (widget.render as jest.Mock).mock.calls[0][0].results,
              helper: instance.getHelper(),
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
      const instance = index({ indexName: 'indexName' });

      const widgets = [createSearchBox(), createPagination()];

      instance.addWidgets(widgets);

      widgets.forEach(widget => {
        expect(widget.render).toHaveBeenCalledTimes(0);
      });

      instance.init(createInitOptions());

      widgets.forEach(widget => {
        expect(widget.render).toHaveBeenCalledTimes(0);
      });

      instance.render(createRenderOptions());

      widgets.forEach(widget => {
        expect(widget.render).toHaveBeenCalledTimes(0);
      });
    });

    it('calls `render` with `scopedResults` coming from siblings and children', async () => {
      const level0 = index({ indexName: 'level0IndexName' });
      const level1 = index({ indexName: 'level1IndexName' });
      const level2 = index({ indexName: 'level2IndexName' });
      const level21 = index({ indexName: 'level21IndexName' });
      const level22 = index({ indexName: 'level22IndexName' });
      const level221 = index({ indexName: 'level221IndexName' });
      const level3 = index({ indexName: 'level3IndexName' });
      const searchBoxLevel0 = createSearchBox();
      const searchBoxLevel1 = createSearchBox();
      const searchBoxLevel21 = createSearchBox();

      level0.addWidgets([
        searchBoxLevel0,
        level1.addWidgets([searchBoxLevel1]),
        level2.addWidgets([
          createSearchBox(),
          level21.addWidgets([searchBoxLevel21]),
          level22.addWidgets([
            createSearchBox(),
            level221.addWidgets([createSearchBox()]),
          ]),
        ]),
        level3.addWidgets([createSearchBox()]),
      ]);

      level0.init(createInitOptions());

      // Simulate a call to search from a widget - this step is required otherwise
      // the DerivedHelper does not contain the results. The `lastResults` attribute
      // is set once the `result` event is emitted.
      level0.getHelper()!.search();

      await runAllMicroTasks();

      level0.render(createRenderOptions());

      // First-level child index
      expect(searchBoxLevel1.render).toHaveBeenCalledTimes(1);
      expect(searchBoxLevel1.render).toHaveBeenCalledWith(
        expect.objectContaining({
          scopedResults: [
            // Root index
            {
              indexId: 'level1IndexName',
              results: (searchBoxLevel1.render as jest.Mock).mock.calls[0][0]
                .results,
              helper: level1.getHelper(),
            },
            // Siblings and children
            {
              indexId: 'level2IndexName',
              results: expect.any(algoliasearchHelper.SearchResults),
              helper: level2.getHelper(),
            },
            {
              indexId: 'level21IndexName',
              results: expect.any(algoliasearchHelper.SearchResults),
              helper: level21.getHelper(),
            },
            {
              indexId: 'level22IndexName',
              results: expect.any(algoliasearchHelper.SearchResults),
              helper: level22.getHelper(),
            },
            {
              indexId: 'level221IndexName',
              results: expect.any(algoliasearchHelper.SearchResults),
              helper: level221.getHelper(),
            },
            {
              indexId: 'level3IndexName',
              results: expect.any(algoliasearchHelper.SearchResults),
              helper: level3.getHelper(),
            },
          ],
        })
      );

      // Sibling index
      expect(searchBoxLevel21.render).toHaveBeenCalledTimes(1);
      expect(searchBoxLevel21.render).toHaveBeenCalledWith(
        expect.objectContaining({
          scopedResults: [
            // Root index
            {
              indexId: 'level21IndexName',
              results: (searchBoxLevel21.render as jest.Mock).mock.calls[0][0]
                .results,
              helper: level21.getHelper(),
            },
            // Siblings and children
            {
              indexId: 'level22IndexName',
              results: expect.any(algoliasearchHelper.SearchResults),
              helper: level22.getHelper(),
            },
            {
              indexId: 'level221IndexName',
              results: expect.any(algoliasearchHelper.SearchResults),
              helper: level221.getHelper(),
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
              indexId: 'level0IndexName',
              results: (searchBoxLevel0.render as jest.Mock).mock.calls[0][0]
                .results,
              helper: level0.getHelper(),
            },
            // Siblings and children
            {
              indexId: 'level1IndexName',
              results: (searchBoxLevel1.render as jest.Mock).mock.calls[0][0]
                .results,
              helper: level1.getHelper(),
            },
            {
              indexId: 'level2IndexName',
              results: expect.any(algoliasearchHelper.SearchResults),
              helper: level2.getHelper(),
            },
            {
              indexId: 'level21IndexName',
              results: expect.any(algoliasearchHelper.SearchResults),
              helper: level21.getHelper(),
            },
            {
              indexId: 'level22IndexName',
              results: expect.any(algoliasearchHelper.SearchResults),
              helper: level22.getHelper(),
            },
            {
              indexId: 'level221IndexName',
              results: expect.any(algoliasearchHelper.SearchResults),
              helper: level221.getHelper(),
            },
            {
              indexId: 'level3IndexName',
              results: expect.any(algoliasearchHelper.SearchResults),
              helper: level3.getHelper(),
            },
          ],
        })
      );
    });
  });

  describe('dispose', () => {
    it('calls `dispose` on its widgets', () => {
      const instance = index({ indexName: 'indexName' });
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
      const instance = index({ indexName: 'indexName' });
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
      const topLevelInstance = index({ indexName: 'topLevelIndexName' });
      const subLevelInstance = index({ indexName: 'subLevelIndexName' });

      topLevelInstance.addWidgets([subLevelInstance]);

      topLevelInstance.init(createInitOptions());

      expect(subLevelInstance.getHelper()).toBeDefined();

      subLevelInstance.dispose(createDisposeOptions());

      expect(subLevelInstance.getHelper()).toBe(null);
    });

    it('removes the listeners on internal Helper', () => {
      const instance = index({ indexName: 'indexName' });
      const searchBox = createSearchBox();

      instance.addWidgets([searchBox]);

      instance.init(createInitOptions());

      // Save the Helper to be able to simulate a change
      const helper = instance.getHelper()!;

      // Simulate a state change
      helper.setQueryParameter('query', 'Apple iPhone');

      expect(searchBox.getWidgetState).toHaveBeenCalledTimes(1);

      instance.dispose(createDisposeOptions());

      // Simulate a state change
      helper.setQueryParameter('query', 'Apple iPhone 5S');

      expect(searchBox.getWidgetState).toHaveBeenCalledTimes(1);
    });

    it('removes the internal Helper', () => {
      const instance = index({ indexName: 'indexName' });

      instance.init(createInitOptions());

      expect(instance.getHelper()).toBeDefined();

      instance.dispose(createDisposeOptions());

      expect(instance.getHelper()).toBe(null);
    });

    it('removes the listeners on DerivedHelper', async () => {
      const instance = index({ indexName: 'indexName' });
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
      const instance = index({ indexName: 'indexName' });
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
