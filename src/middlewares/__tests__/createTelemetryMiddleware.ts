import { createTelemetryMiddleware } from '../';
import { createSearchClient } from '../../../test/mock/createSearchClient';
import instantsearch from '../../lib/main';
import { configure, hits, index, pagination, searchBox } from '../../widgets';

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

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const defaultUserAgent =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1 Safari/605.1.15';
const algoliaUserAgent = 'Algolia Crawler 5.3.2';

describe('telemetry', () => {
  beforeEach(() => {
    document.head.innerHTML = '';
  });

  describe('telemetry disabled', () => {
    it('does not add a meta tag on normal user agent', () => {
      global.navigator.userAgent = defaultUserAgent;

      createTelemetryMiddleware();

      expect(document.head).toMatchInlineSnapshot(`<head />`);
    });

    it("does not add meta tag when there's no window", () => {
      global.navigator.userAgent = algoliaUserAgent;

      delete global.window;

      createTelemetryMiddleware();

      expect(document.head).toMatchInlineSnapshot(`<head />`);

      global.window = window;
    });
  });

  describe('telemetry enabled', () => {
    beforeEach(() => {
      global.navigator.userAgent = algoliaUserAgent;
    });

    it('adds a meta tag', () => {
      createTelemetryMiddleware();

      expect(document.head).toMatchInlineSnapshot(`
        <head>
          <meta
            name="instantsearch:widgets"
          />
        </head>
      `);
    });

    it('fills it with widgets after start', async () => {
      // not using createTelemetryMiddleware() here,
      // since telemetry is built into instantsearch
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
    content="{\\"widgets\\":[{\\"type\\":\\"ais.searchBox\\",\\"params\\":[],\\"official\\":true},{\\"type\\":\\"ais.searchBox\\",\\"params\\":[],\\"official\\":true},{\\"type\\":\\"ais.hits\\",\\"params\\":[\\"escapeHTML\\"],\\"official\\":true},{\\"type\\":\\"ais.index\\",\\"params\\":[],\\"official\\":true},{\\"type\\":\\"ais.pagination\\",\\"params\\":[],\\"official\\":true},{\\"type\\":\\"ais.configure\\",\\"params\\":[\\"searchParameters\\"],\\"official\\":true}]}"
    name="instantsearch:widgets"
  />
</head>
`);

      expect(JSON.parse(document.head.querySelector('meta')!.content))
        .toMatchInlineSnapshot(`
Object {
  "widgets": Array [
    Object {
      "official": true,
      "params": Array [],
      "type": "ais.searchBox",
    },
    Object {
      "official": true,
      "params": Array [],
      "type": "ais.searchBox",
    },
    Object {
      "official": true,
      "params": Array [
        "escapeHTML",
      ],
      "type": "ais.hits",
    },
    Object {
      "official": true,
      "params": Array [],
      "type": "ais.index",
    },
    Object {
      "official": true,
      "params": Array [],
      "type": "ais.pagination",
    },
    Object {
      "official": true,
      "params": Array [
        "searchParameters",
      ],
      "type": "ais.configure",
    },
  ],
}
`);
    });
  });
});
