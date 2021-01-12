import { createTelemetryMiddleware } from '../';
import { createSearchClient } from '../../../test/mock/createSearchClient';
import instantsearch from '../../lib/main';
import { configure, hits, index, pagination, searchBox } from '../../widgets';
import { isTelemetryEnabled } from '../createTelemetryMiddleware';

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
    it('does not enable on normal user agent', () => {
      global.navigator.userAgent = defaultUserAgent;

      expect(isTelemetryEnabled()).toBe(false);
    });

    it("does not enable when there's no window", () => {
      global.navigator.userAgent = algoliaUserAgent;

      // @ts-ignore
      delete global.window;

      createTelemetryMiddleware();

      expect(isTelemetryEnabled()).toBe(false);

      global.window = window;
    });
  });

  describe('telemetry enabled', () => {
    beforeEach(() => {
      global.navigator.userAgent = algoliaUserAgent;
    });

    it('telemetry enabled returns true', () => {
      expect(isTelemetryEnabled()).toBe(true);
    });

    it('does not add meta before subscribe', () => {
      createTelemetryMiddleware();

      expect(document.head).toMatchInlineSnapshot(`<head />`);
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
    content="{\\"widgets\\":[{\\"type\\":\\"ais.searchBox\\",\\"params\\":[]},{\\"type\\":\\"ais.searchBox\\",\\"params\\":[]},{\\"type\\":\\"ais.hits\\",\\"params\\":[\\"escapeHTML\\"]},{\\"type\\":\\"ais.index\\",\\"params\\":[]},{\\"type\\":\\"ais.pagination\\",\\"params\\":[]},{\\"type\\":\\"ais.configure\\",\\"params\\":[\\"searchParameters\\"]}]}"
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
    },
    Object {
      "params": Array [],
      "type": "ais.searchBox",
    },
    Object {
      "params": Array [
        "escapeHTML",
      ],
      "type": "ais.hits",
    },
    Object {
      "params": Array [],
      "type": "ais.index",
    },
    Object {
      "params": Array [],
      "type": "ais.pagination",
    },
    Object {
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
