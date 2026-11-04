/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */
/** @jsx h */
import { initialize } from '@googlemaps/jest-mocks';
import { createSearchClient } from '@instantsearch/mocks';
import { wait } from '@instantsearch/testutils/wait';
import { h } from 'preact';

import instantsearch from '../../../index.es';
import geoSearch from '../geo-search';

beforeEach(() => {
  document.body.innerHTML = '';
  initialize();
});

describe('geoSearch', () => {
  describe('templates', () => {
    test('renders default templates', async () => {
      const container = document.createElement('div');
      const container2 = document.createElement('div');
      const searchClient = createSearchClient();

      const search = instantsearch({ indexName: 'indexName', searchClient });

      search.addWidgets([
        geoSearch({ container, googleReference: window.google }),
        geoSearch({
          container: container2,
          googleReference: window.google,
          enableRefineControl: false,
          enableRefineOnMapMove: false,
        }),
      ]);

      search.start();

      await wait(0);

      expect(container).toMatchInlineSnapshot(`
<div>
  <div
    class="ais-GeoSearch"
  >
    <div
      class="ais-GeoSearch-map"
    />
    <div
      class="ais-GeoSearch-tree"
    >
      <div>
        <div
          class="ais-GeoSearch-control"
        >
          <label
            class="ais-GeoSearch-label ais-GeoSearch-label--selected"
          >
            <input
              class="ais-GeoSearch-input"
              type="checkbox"
            />
            <span>
              Search as I move the map
            </span>
          </label>
        </div>
      </div>
    </div>
  </div>
</div>
`);
      expect(container2).toMatchInlineSnapshot(`
<div>
  <div
    class="ais-GeoSearch"
  >
    <div
      class="ais-GeoSearch-map"
    />
    <div
      class="ais-GeoSearch-tree"
    >
      <div>
        <div
          class="ais-GeoSearch-control"
        >
          <button
            class="ais-GeoSearch-redo ais-GeoSearch-redo--disabled"
            disabled=""
          >
            <span>
              Redo search here
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
</div>
`);
    });

    test('renders with templates using `html`', async () => {
      const container = document.createElement('div');
      const container2 = document.createElement('div');
      const searchClient = createSearchClient();

      const search = instantsearch({ indexName: 'indexName', searchClient });

      search.addWidgets([
        geoSearch({
          container,
          googleReference: window.google,
          templates: {
            HTMLMarker({ objectID }, { html }) {
              return html`<strong>${objectID}</strong>`;
            },
            reset(_, { html }) {
              return html`<strong>Clear map refinement</strong>`;
            },
            toggle(_, { html }) {
              return html`<strong>Search on move</strong>`;
            },
          },
        }),
        geoSearch({
          container: container2,
          googleReference: window.google,
          enableRefineControl: false,
          enableRefineOnMapMove: false,
          templates: {
            redo(_, { html }) {
              return html`<strong>Redo</strong>`;
            },
          },
        }),
      ]);

      search.start();

      await wait(0);

      expect(container).toMatchInlineSnapshot(`
<div>
  <div
    class="ais-GeoSearch"
  >
    <div
      class="ais-GeoSearch-map"
    />
    <div
      class="ais-GeoSearch-tree"
    >
      <div>
        <div
          class="ais-GeoSearch-control"
        >
          <label
            class="ais-GeoSearch-label ais-GeoSearch-label--selected"
          >
            <input
              class="ais-GeoSearch-input"
              type="checkbox"
            />
            <span>
              <strong>
                Search on move
              </strong>
            </span>
          </label>
        </div>
      </div>
    </div>
  </div>
</div>
`);
      expect(container2).toMatchInlineSnapshot(`
<div>
  <div
    class="ais-GeoSearch"
  >
    <div
      class="ais-GeoSearch-map"
    />
    <div
      class="ais-GeoSearch-tree"
    >
      <div>
        <div
          class="ais-GeoSearch-control"
        >
          <button
            class="ais-GeoSearch-redo ais-GeoSearch-redo--disabled"
            disabled=""
          >
            <span>
              <strong>
                Redo
              </strong>
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
</div>
`);
    });

    test('renders with templates using JSX', async () => {
      const container = document.createElement('div');
      const container2 = document.createElement('div');
      const searchClient = createSearchClient();

      const search = instantsearch({ indexName: 'indexName', searchClient });

      search.addWidgets([
        geoSearch({
          container,
          googleReference: window.google,
          templates: {
            HTMLMarker({ objectID }) {
              return <strong>{objectID}</strong>;
            },
            reset() {
              return <strong>Clear map refinement</strong>;
            },
            toggle() {
              return <strong>Search on move</strong>;
            },
          },
        }),
        geoSearch({
          container: container2,
          googleReference: window.google,
          enableRefineControl: false,
          enableRefineOnMapMove: false,
          templates: {
            redo() {
              return <strong>Redo</strong>;
            },
          },
        }),
      ]);

      search.start();

      await wait(0);

      expect(container).toMatchInlineSnapshot(`
<div>
  <div
    class="ais-GeoSearch"
  >
    <div
      class="ais-GeoSearch-map"
    />
    <div
      class="ais-GeoSearch-tree"
    >
      <div>
        <div
          class="ais-GeoSearch-control"
        >
          <label
            class="ais-GeoSearch-label ais-GeoSearch-label--selected"
          >
            <input
              class="ais-GeoSearch-input"
              type="checkbox"
            />
            <span>
              <strong>
                Search on move
              </strong>
            </span>
          </label>
        </div>
      </div>
    </div>
  </div>
</div>
`);
      expect(container2).toMatchInlineSnapshot(`
<div>
  <div
    class="ais-GeoSearch"
  >
    <div
      class="ais-GeoSearch-map"
    />
    <div
      class="ais-GeoSearch-tree"
    >
      <div>
        <div
          class="ais-GeoSearch-control"
        >
          <button
            class="ais-GeoSearch-redo ais-GeoSearch-redo--disabled"
            disabled=""
          >
            <span>
              <strong>
                Redo
              </strong>
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
</div>
`);
    });
  });
});
