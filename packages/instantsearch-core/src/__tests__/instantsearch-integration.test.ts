/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { createSearchClient } from '@instantsearch/mocks';
import { createRecommendSearchClient } from '@instantsearch/mocks/fixtures';
import { castToJestMock } from '@instantsearch/testutils';
import { wait } from '@instantsearch/testutils/wait';

import {
  instantsearch,
  connectSearchBox,
  connectFrequentlyBoughtTogether,
} from '..';

import type { MiddlewareDefinition } from '../types';

describe('middleware', () => {
  it("runs middlewares' onStateChange when uiState changes", async () => {
    const search = instantsearch({
      indexName: 'instant_search',
      searchClient: createSearchClient(),
    });

    const middlewareDefinition: MiddlewareDefinition = {
      $$type: 'fake',
      $$internal: false,
      onStateChange: jest.fn(),
      subscribe: jest.fn(),
      started: jest.fn(),
      unsubscribe: jest.fn(),
    };

    search.use(() => middlewareDefinition);

    search.addWidgets([connectSearchBox(() => {})({})]);

    search.start();

    search.renderState.instant_search.searchBox!.refine('q');

    await wait(0);
    expect(middlewareDefinition.onStateChange).toHaveBeenCalledTimes(1);
  });

  it("runs middlewares' onStateChange when uiState changes with user-provided onStateChange param", async () => {
    const search = instantsearch({
      indexName: 'instant_search',
      searchClient: createSearchClient(),
      onStateChange({ uiState, setUiState }) {
        setUiState(uiState);
      },
    });

    const middlewareDefinition: MiddlewareDefinition = {
      $$type: 'fake',
      $$internal: false,
      onStateChange: jest.fn(),
      subscribe: jest.fn(),
      started: jest.fn(),
      unsubscribe: jest.fn(),
    };

    search.use(() => middlewareDefinition);

    search.addWidgets([connectSearchBox(() => {})({})]);

    search.start();

    search.renderState.instant_search.searchBox!.refine('q');

    await wait(0);
    expect(middlewareDefinition.onStateChange).toHaveBeenCalledTimes(1);
  });
});

describe('errors', () => {
  it('client errors can be handled', () => {
    const search = instantsearch({
      searchClient: createSearchClient({
        search() {
          return Promise.reject(new Error('test!'));
        },
      }),
      indexName: '123',
    });

    search.addWidgets([connectSearchBox(() => {})({})]);

    expect.assertions(2);

    search.on('error', (error) => {
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('test!');
    });

    search.start();
  });
});

describe('network requests', () => {
  describe('no insights', () => {
    it('sends no search or recommend query when there are no widgets', async () => {
      const searchClient = createRecommendSearchClient();
      instantsearch({
        indexName: 'indexName',
        searchClient,
      }).start();

      await wait(0);

      expect(
        castToJestMock(searchClient.search).mock.calls[0]?.[0]
      ).toMatchInlineSnapshot(`undefined`);
      expect(
        castToJestMock(searchClient.getRecommendations!).mock.calls[0]?.[0]
      ).toMatchInlineSnapshot(`undefined`);
    });

    it('sends only one search query when there are search widgets', async () => {
      const searchClient = createRecommendSearchClient();
      instantsearch({
        indexName: 'indexName',
        searchClient,
      })
        .addWidgets([connectSearchBox(() => {})({})])
        .start();

      await wait(0);

      expect(castToJestMock(searchClient.search).mock.calls[0]?.[0])
        .toMatchInlineSnapshot(`
        [
          {
            "indexName": "indexName",
            "params": {
              "query": "",
            },
          },
        ]
      `);
      expect(
        castToJestMock(searchClient.getRecommendations!).mock.calls[0]?.[0]
      ).toMatchInlineSnapshot(`undefined`);
    });

    it('sends only one recommend query when there are recommend widgets', async () => {
      const searchClient = createRecommendSearchClient();
      instantsearch({
        indexName: 'indexName',
        searchClient,
      })
        .addWidgets([
          connectFrequentlyBoughtTogether(() => {})({
            objectIDs: ['one'],
          }),
        ])
        .start();

      await wait(0);

      expect(
        castToJestMock(searchClient.search).mock.calls[0]?.[0]
      ).toMatchInlineSnapshot(`undefined`);
      expect(
        castToJestMock(searchClient.getRecommendations!).mock.calls[0]?.[0]
      ).toMatchInlineSnapshot(`
        [
          {
            "fallbackParameters": undefined,
            "indexName": "indexName",
            "maxRecommendations": undefined,
            "model": "bought-together",
            "objectID": "one",
            "queryParameters": {
              "highlightPostTag": "__/ais-highlight__",
              "highlightPreTag": "__ais-highlight__",
            },
            "threshold": 0,
          },
        ]
      `);
    });

    it('sends only one search and recommend query when there are search and recommend widgets', async () => {
      const searchClient = createRecommendSearchClient();
      instantsearch({
        indexName: 'indexName',
        searchClient,
      })
        .addWidgets([
          connectSearchBox(() => {})({}),
          connectFrequentlyBoughtTogether(() => {})({
            objectIDs: ['one'],
          }),
        ])
        .start();

      await wait(0);

      expect(castToJestMock(searchClient.search).mock.calls[0]?.[0])
        .toMatchInlineSnapshot(`
        [
          {
            "indexName": "indexName",
            "params": {
              "query": "",
            },
          },
        ]
      `);
      expect(
        castToJestMock(searchClient.getRecommendations!).mock.calls[0]?.[0]
      ).toMatchInlineSnapshot(`
        [
          {
            "fallbackParameters": undefined,
            "indexName": "indexName",
            "maxRecommendations": undefined,
            "model": "bought-together",
            "objectID": "one",
            "queryParameters": {
              "highlightPostTag": "__/ais-highlight__",
              "highlightPreTag": "__ais-highlight__",
            },
            "threshold": 0,
          },
        ]
      `);
    });
  });

  describe('with insights', () => {
    let cookie: string;
    beforeEach(() => {
      cookie = document.cookie;
      document.cookie = '_ALGOLIA=cookie-key';
    });

    afterEach(() => {
      document.cookie = cookie;
    });

    it('sends no search or recommend query when there are no widgets', async () => {
      const searchClient = createRecommendSearchClient();
      instantsearch({
        indexName: 'indexName',
        searchClient,
        insights: true,
      }).start();

      await wait(0);

      expect(
        castToJestMock(searchClient.search).mock.calls[0]?.[0]
      ).toMatchInlineSnapshot(`undefined`);
      expect(
        castToJestMock(searchClient.getRecommendations!).mock.calls[0]?.[0]
      ).toMatchInlineSnapshot(`undefined`);
    });

    it('sends only one search query when there are search widgets', async () => {
      const searchClient = createRecommendSearchClient();
      instantsearch({
        indexName: 'indexName',
        searchClient,
        insights: true,
      })
        .addWidgets([connectSearchBox(() => {})({})])
        .start();

      await wait(0);

      expect(castToJestMock(searchClient.search).mock.calls[0]?.[0])
        .toMatchInlineSnapshot(`
        [
          {
            "indexName": "indexName",
            "params": {
              "clickAnalytics": true,
              "query": "",
              "userToken": "cookie-key",
            },
          },
        ]
      `);
      expect(
        castToJestMock(searchClient.getRecommendations!).mock.calls[0]?.[0]
      ).toMatchInlineSnapshot(`undefined`);
    });

    it('sends only one recommend query when there are recommend widgets', async () => {
      const searchClient = createRecommendSearchClient();
      instantsearch({
        indexName: 'indexName',
        searchClient,
        insights: true,
      })
        .addWidgets([
          connectFrequentlyBoughtTogether(() => {})({
            objectIDs: ['one'],
          }),
        ])
        .start();

      await wait(0);

      expect(
        castToJestMock(searchClient.search).mock.calls[0]?.[0]
      ).toMatchInlineSnapshot(`undefined`);
      expect(
        castToJestMock(searchClient.getRecommendations!).mock.calls[0]?.[0]
      ).toMatchInlineSnapshot(`
        [
          {
            "fallbackParameters": undefined,
            "indexName": "indexName",
            "maxRecommendations": undefined,
            "model": "bought-together",
            "objectID": "one",
            "queryParameters": {
              "highlightPostTag": "__/ais-highlight__",
              "highlightPreTag": "__ais-highlight__",
            },
            "threshold": 0,
          },
        ]
      `);
    });

    it('sends only one search and recommend query when there are search and recommend widgets', async () => {
      const searchClient = createRecommendSearchClient();
      instantsearch({
        indexName: 'indexName',
        searchClient,
        insights: true,
      })
        .addWidgets([
          connectSearchBox(() => {})({}),
          connectFrequentlyBoughtTogether(() => {})({
            objectIDs: ['one'],
          }),
        ])
        .start();

      await wait(0);

      expect(castToJestMock(searchClient.search).mock.calls[0]?.[0])
        .toMatchInlineSnapshot(`
        [
          {
            "indexName": "indexName",
            "params": {
              "clickAnalytics": true,
              "query": "",
              "userToken": "cookie-key",
            },
          },
        ]
      `);
      expect(
        castToJestMock(searchClient.getRecommendations!).mock.calls[0]?.[0]
      ).toMatchInlineSnapshot(`
        [
          {
            "fallbackParameters": undefined,
            "indexName": "indexName",
            "maxRecommendations": undefined,
            "model": "bought-together",
            "objectID": "one",
            "queryParameters": {
              "highlightPostTag": "__/ais-highlight__",
              "highlightPreTag": "__ais-highlight__",
            },
            "threshold": 0,
          },
        ]
      `);
    });
  });

  describe('with insights (no cookie)', () => {
    let cookie: string;
    beforeEach(() => {
      cookie = document.cookie;
      document.cookie = '_ALGOLIA=';
    });

    afterEach(() => {
      document.cookie = cookie;
    });

    it('sends no search or recommend query when there are no widgets', async () => {
      const searchClient = createRecommendSearchClient();
      instantsearch({
        indexName: 'indexName',
        searchClient,
        insights: true,
      }).start();

      await wait(0);

      expect(
        castToJestMock(searchClient.search).mock.calls[0]?.[0]
      ).toMatchInlineSnapshot(`undefined`);
      expect(
        castToJestMock(searchClient.getRecommendations!).mock.calls[0]?.[0]
      ).toMatchInlineSnapshot(`undefined`);
    });

    it('sends only one search query when there are search widgets', async () => {
      const searchClient = createRecommendSearchClient();
      instantsearch({
        indexName: 'indexName',
        searchClient,
        insights: true,
      })
        .addWidgets([connectSearchBox(() => {})({})])
        .start();

      await wait(0);

      expect(castToJestMock(searchClient.search).mock.calls[0]?.[0])
        .toMatchInlineSnapshot(`
        [
          {
            "indexName": "indexName",
            "params": {
              "clickAnalytics": true,
              "query": "",
              "userToken": "cookie-key",
            },
          },
        ]
      `);
      expect(
        castToJestMock(searchClient.getRecommendations!).mock.calls[0]?.[0]
      ).toMatchInlineSnapshot(`undefined`);
    });

    it('sends only one recommend query when there are recommend widgets', async () => {
      const searchClient = createRecommendSearchClient();
      instantsearch({
        indexName: 'indexName',
        searchClient,
        insights: true,
      })
        .addWidgets([
          connectFrequentlyBoughtTogether(() => {})({
            objectIDs: ['one'],
          }),
        ])
        .start();

      await wait(0);

      expect(
        castToJestMock(searchClient.search).mock.calls[0]?.[0]
      ).toMatchInlineSnapshot(`undefined`);
      expect(
        castToJestMock(searchClient.getRecommendations!).mock.calls[0]?.[0]
      ).toMatchInlineSnapshot(`
        [
          {
            "fallbackParameters": undefined,
            "indexName": "indexName",
            "maxRecommendations": undefined,
            "model": "bought-together",
            "objectID": "one",
            "queryParameters": {
              "highlightPostTag": "__/ais-highlight__",
              "highlightPreTag": "__ais-highlight__",
            },
            "threshold": 0,
          },
        ]
      `);
    });

    it('sends only one search and recommend query when there are search and recommend widgets', async () => {
      const searchClient = createRecommendSearchClient();
      instantsearch({
        indexName: 'indexName',
        searchClient,
        insights: true,
      })
        .addWidgets([
          connectSearchBox(() => {})({}),
          connectFrequentlyBoughtTogether(() => {})({
            objectIDs: ['one'],
          }),
        ])
        .start();

      await wait(0);

      expect(castToJestMock(searchClient.search).mock.calls[0]?.[0])
        .toMatchInlineSnapshot(`
        [
          {
            "indexName": "indexName",
            "params": {
              "clickAnalytics": true,
              "query": "",
              "userToken": "cookie-key",
            },
          },
        ]
      `);
      expect(
        castToJestMock(searchClient.getRecommendations!).mock.calls[0]?.[0]
      ).toMatchInlineSnapshot(`
        [
          {
            "fallbackParameters": undefined,
            "indexName": "indexName",
            "maxRecommendations": undefined,
            "model": "bought-together",
            "objectID": "one",
            "queryParameters": {
              "highlightPostTag": "__/ais-highlight__",
              "highlightPreTag": "__ais-highlight__",
            },
            "threshold": 0,
          },
        ]
      `);
    });
  });

  describe('interactive life cycle', () => {
    it('sends no queries when widgets are removed', async () => {
      const searchClient = createRecommendSearchClient();
      const searchBoxWidget = connectSearchBox(() => {})({});
      const frequentlyBoughtTogetherWidget = connectFrequentlyBoughtTogether(
        () => {}
      )({
        objectIDs: ['one'],
      });
      const search = instantsearch({
        indexName: 'indexName',
        searchClient,
      }).addWidgets([searchBoxWidget, frequentlyBoughtTogetherWidget]);

      search.start();
      await wait(0);

      expect(castToJestMock(searchClient.search).mock.calls[0]?.[0])
        .toMatchInlineSnapshot(`
        [
          {
            "indexName": "indexName",
            "params": {
              "query": "",
            },
          },
        ]
      `);
      expect(
        castToJestMock(searchClient.getRecommendations!).mock.calls[0]?.[0]
      ).toMatchInlineSnapshot(`
        [
          {
            "fallbackParameters": undefined,
            "indexName": "indexName",
            "maxRecommendations": undefined,
            "model": "bought-together",
            "objectID": "one",
            "queryParameters": {
              "highlightPostTag": "__/ais-highlight__",
              "highlightPreTag": "__ais-highlight__",
            },
            "threshold": 0,
          },
        ]
      `);

      search.removeWidgets([searchBoxWidget, frequentlyBoughtTogetherWidget]);

      await wait(0);

      expect(
        castToJestMock(searchClient.search).mock.calls[1]?.[0]
      ).toMatchInlineSnapshot(`undefined`);
      expect(
        castToJestMock(searchClient.getRecommendations!).mock.calls[1]?.[0]
      ).toMatchInlineSnapshot(`undefined`);

      // Ensure that calling search() after removing all widgets doesn't trigger a new search
      search.helper!.search();

      expect(
        castToJestMock(searchClient.search).mock.calls[2]?.[0]
      ).toMatchInlineSnapshot(`undefined`);
      expect(
        castToJestMock(searchClient.getRecommendations!).mock.calls[2]?.[0]
      ).toMatchInlineSnapshot(`undefined`);
    });
  });
});
