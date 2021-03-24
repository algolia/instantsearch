import algoliasearch from 'algoliasearch';
import algoliasearchV3 from 'algoliasearch-v3';
import { createMetadataMiddleware } from '..';
import { createSearchClient } from '../../../test/mock/createSearchClient';
import { wait } from '../../../test/utils/wait';
import instantsearch from '../../lib/main';
import { configure, hits, index, pagination, searchBox } from '../../widgets';
import { isMetadataEnabled } from '../createMetadataMiddleware';

declare global {
  // using namespace so it's only in this file
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface Global {
      navigator: {
        userAgent: string;
      };
      window: Window;
    }
  }
}

const { window } = global;
Object.defineProperty(
  window.navigator,
  'userAgent',
  (value => ({
    get() {
      return value;
    },
    set(v: string) {
      value = v;
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
      global.navigator.userAgent = defaultUserAgent;

      expect(isMetadataEnabled()).toBe(false);
    });

    it("does not enable when there's no window", () => {
      global.navigator.userAgent = algoliaUserAgent;

      // @ts-expect-error
      delete global.window;

      createMetadataMiddleware();

      expect(isMetadataEnabled()).toBe(false);

      global.window = window;
    });
  });

  describe('metadata enabled', () => {
    beforeEach(() => {
      global.navigator.userAgent = algoliaUserAgent;
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
            content="{\\"widgets\\":[{\\"type\\":\\"ais.searchBox\\",\\"widgetType\\":\\"ais.searchBox\\",\\"params\\":[]},{\\"type\\":\\"ais.searchBox\\",\\"widgetType\\":\\"ais.searchBox\\",\\"params\\":[]},{\\"type\\":\\"ais.hits\\",\\"widgetType\\":\\"ais.hits\\",\\"params\\":[\\"escapeHTML\\"]},{\\"type\\":\\"ais.index\\",\\"widgetType\\":\\"ais.index\\",\\"params\\":[]},{\\"type\\":\\"ais.pagination\\",\\"widgetType\\":\\"ais.pagination\\",\\"params\\":[]},{\\"type\\":\\"ais.configure\\",\\"widgetType\\":\\"ais.configure\\",\\"params\\":[\\"searchParameters\\"]}]}"
            name="instantsearch:widgets"
          />
        </head>
      `);

      expect(JSON.parse(document.head.querySelector('meta')!.content))
        .toMatchInlineSnapshot(`
        Object {
          "widgets": Array [
            Object {
              "params": Array [],
              "type": "ais.searchBox",
              "widgetType": "ais.searchBox",
            },
            Object {
              "params": Array [],
              "type": "ais.searchBox",
              "widgetType": "ais.searchBox",
            },
            Object {
              "params": Array [
                "escapeHTML",
              ],
              "type": "ais.hits",
              "widgetType": "ais.hits",
            },
            Object {
              "params": Array [],
              "type": "ais.index",
              "widgetType": "ais.index",
            },
            Object {
              "params": Array [],
              "type": "ais.pagination",
              "widgetType": "ais.pagination",
            },
            Object {
              "params": Array [
                "searchParameters",
              ],
              "type": "ais.configure",
              "widgetType": "ais.configure",
            },
          ],
        }
      `);
    });

    describe('fills it with user agent after start', () => {
      it('for the v4 client', async () => {
        const fakeSearchClient = createSearchClient();
        const searchClient = algoliasearch('', '');
        // @ts-expect-error overriding the search method for testing
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

        expect(
          JSON.parse(document.head.querySelector('meta')!.content)
        ).toEqual({
          ua: expect.stringMatching(
            /^Algolia for JavaScript \(4\.(\d+\.?)+\); Node\.js \((\d+\.?)+\); instantsearch\.js \((\d+\.?)+\); JS Helper \((\d+\.?)+\)$/
          ),
          widgets: [],
        });
      });

      it('for the v4 client with custom user agent', async () => {
        const fakeSearchClient = createSearchClient();
        const searchClient = algoliasearch('', '');
        // @ts-expect-error overriding the search method for testing
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

        expect(
          JSON.parse(document.head.querySelector('meta')!.content)
        ).toEqual({
          ua: expect.stringMatching(
            /^Algolia for JavaScript \(4\.(\d+\.?)+\); Node\.js \((\d+\.?)+\); instantsearch\.js \((\d+\.?)+\); JS Helper \((\d+\.?)+\); test \(cool\)$/
          ),
          widgets: [],
        });
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

        expect(
          JSON.parse(document.head.querySelector('meta')!.content)
        ).toEqual({
          ua: expect.stringMatching(
            /^Algolia for JavaScript \(3\.(\d+\.?)+\); Node\.js \((\d+\.?)+\); instantsearch\.js \((\d+\.?)+\); JS Helper \((\d+\.?)+\)$/
          ),
          widgets: [],
        });
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

        expect(
          JSON.parse(document.head.querySelector('meta')!.content)
        ).toEqual({
          ua: expect.stringMatching(
            /^Algolia for JavaScript \(3\.(\d+\.?)+\); Node\.js \((\d+\.?)+\); instantsearch\.js \((\d+\.?)+\); JS Helper \((\d+\.?)+\); test \(cool\)$/
          ),
          widgets: [],
        });
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
          widgets: [],
        });
      });
    });
  });
});
