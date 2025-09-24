/**
 * @jest-environment jsdom @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { createSearchClient } from '@instantsearch/mocks';
import { wait } from '@instantsearch/testutils/wait';
import algoliasearchV3 from 'algoliasearch-v3';
import algoliasearchV4 from 'algoliasearch-v4';
import { algoliasearch as algoliasearchV5 } from 'algoliasearch-v5';

import { createMetadataMiddleware } from '..';
import instantsearch from '../..';
import { configure, hits, index, pagination, searchBox } from '../../widgets';
import { isMetadataEnabled } from '../createMetadataMiddleware';

declare global {
  interface Navigator {
    // make mutable
    userAgent: string;
  }
}

const { window } = global;

Object.defineProperty(
  window.navigator,
  'userAgent',
  ((value) => ({
    get() {
      return value;
    },
    // TypeScript infers from the namespace, this isn't used.
    // @ts-ignore
    set(newValue) {
      value = newValue;
    },
  }))(window.navigator.userAgent)
);

const defaultUserAgent =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1 Safari/605.1.15';
const algoliaUserAgent = 'Algolia Crawler 5.3.2';

describe('createMetadataMiddleware', () => {
  beforeEach(() => {
    document.head.innerHTML = '';
  });

  describe('metadata disabled', () => {
    it('does not enable on normal user agent', () => {
      global.navigator!.userAgent = defaultUserAgent;

      expect(isMetadataEnabled()).toBe(false);

      global.window = window;
    });

    it("does not enable when there's no window", () => {
      // @ts-expect-error
      delete global.window;

      createMetadataMiddleware();

      expect(isMetadataEnabled()).toBe(false);

      global.window = window;
    });

    it("does not enable when there's a window but no navigator", () => {
      // @ts-expect-error (simulate no navigator)
      global.navigator = undefined;

      createMetadataMiddleware();

      expect(isMetadataEnabled()).toBe(false);

      global.window = window;
    });

    it("does not enable when navigator is different from browser's (React Native)", () => {
      // @ts-expect-error (simulate no userAgent)
      global.navigator!.userAgent = undefined;

      createMetadataMiddleware();

      expect(isMetadataEnabled()).toBe(false);

      global.window = window;
    });
  });

  describe('metadata enabled', () => {
    beforeEach(() => {
      global.navigator!.userAgent = algoliaUserAgent;
    });

    it('metadata enabled returns true', () => {
      expect(isMetadataEnabled()).toBe(true);
    });

    it('does not add meta before subscribe', () => {
      createMetadataMiddleware();

      expect(document.head).toMatchInlineSnapshot(`<head />`);
    });

    it('fills it with widgets after start', async () => {
      // not using createMetadataMiddleware() here,
      // since metadata is built into instantsearch
      const search = instantsearch({
        searchClient: createSearchClient(),
        indexName: 'test',
      });

      search.addWidgets([
        searchBox({ container: document.createElement('div') }),
        searchBox({ container: document.createElement('div') }),
        hits({ container: document.createElement('div'), escapeHTML: true }),
        index({ indexName: 'test2' }).addWidgets([
          pagination({ container: document.createElement('div') }),
          configure({ distinct: true, filters: 'hehe secret string!' }),
        ]),
      ]);

      search.start();

      await wait(100);

      expect(document.head).toMatchInlineSnapshot(`
        <head>
          <meta
            content="{\\"widgets\\":[{\\"type\\":\\"ais.searchBox\\",\\"widgetType\\":\\"ais.searchBox\\",\\"params\\":[]},{\\"type\\":\\"ais.searchBox\\",\\"widgetType\\":\\"ais.searchBox\\",\\"params\\":[]},{\\"type\\":\\"ais.hits\\",\\"widgetType\\":\\"ais.hits\\",\\"params\\":[\\"escapeHTML\\"]},{\\"type\\":\\"ais.index\\",\\"widgetType\\":\\"ais.index\\",\\"params\\":[]},{\\"type\\":\\"ais.pagination\\",\\"widgetType\\":\\"ais.pagination\\",\\"params\\":[]},{\\"type\\":\\"ais.configure\\",\\"widgetType\\":\\"ais.configure\\",\\"params\\":[\\"searchParameters\\"]},{\\"middleware\\":true,\\"type\\":\\"ais.metadata\\",\\"internal\\":true}]}"
            name="instantsearch:widgets"
          />
        </head>
      `);

      expect(JSON.parse(document.head.querySelector('meta')!.content).widgets)
        .toMatchInlineSnapshot(`
        [
          {
            "params": [],
            "type": "ais.searchBox",
            "widgetType": "ais.searchBox",
          },
          {
            "params": [],
            "type": "ais.searchBox",
            "widgetType": "ais.searchBox",
          },
          {
            "params": [
              "escapeHTML",
            ],
            "type": "ais.hits",
            "widgetType": "ais.hits",
          },
          {
            "params": [],
            "type": "ais.index",
            "widgetType": "ais.index",
          },
          {
            "params": [],
            "type": "ais.pagination",
            "widgetType": "ais.pagination",
          },
          {
            "params": [
              "searchParameters",
            ],
            "type": "ais.configure",
            "widgetType": "ais.configure",
          },
          {
            "internal": true,
            "middleware": true,
            "type": "ais.metadata",
          },
        ]
      `);
    });

    it('fills it with metadata after start', async () => {
      // not using createMetadataMiddleware() here,
      // since metadata is built into instantsearch
      const search = instantsearch({
        searchClient: createSearchClient(),
        indexName: 'test',
        routing: true,
      });

      search.use(
        () => ({ $$type: 'test', $$internal: false }),
        // @ts-expect-error (unknown middleware, shouldn't error)
        () => ({})
      );

      search.start();

      await wait(100);

      expect(document.head).toMatchInlineSnapshot(`
        <head>
          <meta
            content="{\\"widgets\\":[{\\"middleware\\":true,\\"type\\":\\"ais.router({router:ais.browser, stateMapping:ais.simple})\\",\\"internal\\":true},{\\"middleware\\":true,\\"type\\":\\"ais.metadata\\",\\"internal\\":true},{\\"middleware\\":true,\\"type\\":\\"test\\",\\"internal\\":false},{\\"middleware\\":true,\\"type\\":\\"__unknown__\\",\\"internal\\":false}]}"
            name="instantsearch:widgets"
          />
        </head>
      `);

      expect(JSON.parse(document.head.querySelector('meta')!.content).widgets)
        .toMatchInlineSnapshot(`
        [
          {
            "internal": true,
            "middleware": true,
            "type": "ais.router({router:ais.browser, stateMapping:ais.simple})",
          },
          {
            "internal": true,
            "middleware": true,
            "type": "ais.metadata",
          },
          {
            "internal": false,
            "middleware": true,
            "type": "test",
          },
          {
            "internal": false,
            "middleware": true,
            "type": "__unknown__",
          },
        ]
      `);
    });

    describe('fills it with user agent after start', () => {
      it('for the v5 client', async () => {
        const fakeSearchClient = createSearchClient();
        const searchClient = algoliasearchV5('qsdf', 'qsdf') as any;
        searchClient.search = fakeSearchClient.search;

        // not using createMetadataMiddleware() here,
        // since metadata is built into instantsearch
        const search = instantsearch({
          searchClient,
          indexName: 'test',
        });

        search.start();

        await wait(100);

        expect(document.head.children).toHaveLength(1);
        expect(document.head.children[0]).toEqual(expect.any(HTMLMetaElement));

        const metadata = JSON.parse(
          document.head.querySelector('meta')!.content
        );

        expect(metadata).toEqual({
          ua: expect.any(String),
          widgets: expect.any(Array),
        });

        expect(
          metadata.ua.split(';').map((part: string) => part.trim())
        ).toEqual([
          expect.stringMatching(/Algolia for JavaScript \(5\..*\)/),
          expect.stringMatching(/Search \(5\..*\)/),
          expect.stringMatching(/Node.js \(.*\)/),
          expect.stringMatching(/instantsearch.js \(4\..*\)/),
          expect.stringMatching(/JS Helper \(3\..*\)/),
        ]);
      });

      it('for the v5 client with custom user agent', async () => {
        const fakeSearchClient = createSearchClient();
        const searchClient = algoliasearchV5('qsdf', 'qsdf') as any;
        searchClient.search = fakeSearchClient.search;

        // not using createMetadataMiddleware() here,
        // since metadata is built into instantsearch
        const search = instantsearch({
          searchClient,
          indexName: 'test',
        });

        search.start();

        searchClient.addAlgoliaAgent('test', 'cool');

        await wait(100);

        expect(document.head.children).toHaveLength(1);
        expect(document.head.children[0]).toEqual(expect.any(HTMLMetaElement));

        const metadata = JSON.parse(
          document.head.querySelector('meta')!.content
        );

        expect(metadata).toEqual({
          ua: expect.any(String),
          widgets: expect.any(Array),
        });

        expect(
          metadata.ua.split(';').map((part: string) => part.trim())
        ).toEqual([
          expect.stringMatching(/Algolia for JavaScript \(5\..*\)/),
          expect.stringMatching(/Search \(5\..*\)/),
          expect.stringMatching(/Node.js \(.*\)/),
          expect.stringMatching(/instantsearch.js \(4\..*\)/),
          expect.stringMatching(/JS Helper \(3\..*\)/),
          'test (cool)',
        ]);
      });

      it('for the v4 client', async () => {
        const fakeSearchClient = createSearchClient();
        const searchClient = algoliasearchV4('', '') as any;
        searchClient.search = fakeSearchClient.search;

        // not using createMetadataMiddleware() here,
        // since metadata is built into instantsearch
        const search = instantsearch({
          searchClient,
          indexName: 'test',
        });

        search.start();

        await wait(100);

        expect(document.head.children).toHaveLength(1);
        expect(document.head.children[0]).toEqual(expect.any(HTMLMetaElement));

        const metadata = JSON.parse(
          document.head.querySelector('meta')!.content
        );

        expect(metadata).toEqual({
          ua: expect.any(String),
          widgets: expect.any(Array),
        });

        expect(
          metadata.ua.split(';').map((part: string) => part.trim())
        ).toEqual([
          expect.stringMatching(/Algolia for JavaScript \(4\..*\)/),
          expect.stringMatching(/Node.js \(.*\)/),
          expect.stringMatching(/instantsearch.js \(4\..*\)/),
          expect.stringMatching(/JS Helper \(3\..*\)/),
        ]);
      });

      it('for the v4 client with custom user agent', async () => {
        const fakeSearchClient = createSearchClient();
        const searchClient = algoliasearchV4('', '') as any;
        searchClient.search = fakeSearchClient.search;

        // not using createMetadataMiddleware() here,
        // since metadata is built into instantsearch
        const search = instantsearch({
          searchClient,
          indexName: 'test',
        });

        search.start();

        searchClient.addAlgoliaAgent('test', 'cool');

        await wait(100);

        expect(document.head.children).toHaveLength(1);
        expect(document.head.children[0]).toEqual(expect.any(HTMLMetaElement));

        const metadata = JSON.parse(
          document.head.querySelector('meta')!.content
        );

        expect(metadata).toEqual({
          ua: expect.any(String),
          widgets: expect.any(Array),
        });

        expect(
          metadata.ua.split(';').map((part: string) => part.trim())
        ).toEqual([
          expect.stringMatching(/Algolia for JavaScript \(4\..*\)/),
          expect.stringMatching(/Node.js \(.*\)/),
          expect.stringMatching(/instantsearch.js \(4\..*\)/),
          expect.stringMatching(/JS Helper \(3\..*\)/),
          'test (cool)',
        ]);
      });

      it('for the v3 client', async () => {
        const fakeSearchClient = createSearchClient();
        const searchClient = algoliasearchV3('qsdf', 'qsdf');
        searchClient.search = fakeSearchClient.search;

        // not using createMetadataMiddleware() here,
        // since metadata is built into instantsearch
        const search = instantsearch({
          searchClient,
          indexName: 'test',
        });

        search.start();

        await wait(100);

        expect(document.head.children).toHaveLength(1);
        expect(document.head.children[0]).toEqual(expect.any(HTMLMetaElement));

        const metadata = JSON.parse(
          document.head.querySelector('meta')!.content
        );

        expect(metadata).toEqual({
          ua: expect.any(String),
          widgets: expect.any(Array),
        });

        expect(
          metadata.ua.split(';').map((part: string) => part.trim())
        ).toEqual([
          expect.stringMatching(/Algolia for JavaScript \(3\..*\)/),
          expect.stringMatching(/Node.js \(.*\)/),
          expect.stringMatching(/instantsearch.js \(4\..*\)/),
          expect.stringMatching(/JS Helper \(3\..*\)/),
        ]);
      });

      it('for the v3 client with custom user agent', async () => {
        const fakeSearchClient = createSearchClient();
        const searchClient = algoliasearchV3('qsdf', 'qsdf');
        searchClient.search = fakeSearchClient.search;

        // not using createMetadataMiddleware() here,
        // since metadata is built into instantsearch
        const search = instantsearch({
          searchClient,
          indexName: 'test',
        });

        search.start();

        searchClient.addAlgoliaAgent('test (cool)');

        await wait(100);

        expect(document.head.children).toHaveLength(1);
        expect(document.head.children[0]).toEqual(expect.any(HTMLMetaElement));

        const metadata = JSON.parse(
          document.head.querySelector('meta')!.content
        );

        expect(metadata).toEqual({
          ua: expect.any(String),
          widgets: expect.any(Array),
        });

        expect(
          metadata.ua.split(';').map((part: string) => part.trim())
        ).toEqual([
          expect.stringMatching(/Algolia for JavaScript \(3\..*\)/),
          expect.stringMatching(/Node.js \(.*\)/),
          expect.stringMatching(/instantsearch.js \(4\..*\)/),
          expect.stringMatching(/JS Helper \(3\..*\)/),
          'test (cool)',
        ]);
      });

      it('for a custom client (does not error)', async () => {
        const searchClient = createSearchClient();

        // not using createMetadataMiddleware() here,
        // since metadata is built into instantsearch
        const search = instantsearch({
          searchClient,
          indexName: 'test',
        });

        search.start();

        await wait(100);

        expect(document.head.children).toHaveLength(1);
        expect(document.head.children[0]).toEqual(expect.any(HTMLMetaElement));

        expect(
          JSON.parse(document.head.querySelector('meta')!.content)
        ).toEqual({
          widgets: expect.any(Array),
        });
      });
    });
  });
});
