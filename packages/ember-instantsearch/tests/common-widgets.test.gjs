import { on } from '@ember/modifier';
import { VERSION as emberVersion } from '@ember/version';
import { runTestSuites } from '@instantsearch/tests/common';
import { createHitsWidgetTests } from '@instantsearch/tests/widgets/hits';
import { createInstantSearchWidgetTests } from '@instantsearch/tests/widgets/instantsearch';
import { createPaginationWidgetTests } from '@instantsearch/tests/widgets/pagination';
import { createRefinementListWidgetTests } from '@instantsearch/tests/widgets/refinement-list';
import { createSearchBoxWidgetTests } from '@instantsearch/tests/widgets/search-box';
import instantSearchVersion from 'instantsearch.js/es/lib/version';
import { pagination, refinementList, searchBox } from 'instantsearch.js/es/widgets/index';

import { version } from 'ember-instantsearch';

import { act, render } from './-support/render.ts';
import { Root } from './-support/root.gjs';

/**
 * The suites in `tests/common` that Ember InstantSearch has widgets for.
 * The other flavors run all of them.
 */
/**
 * `fn` would pass the click event on as the last argument of `sendEvent`,
 * which takes it as extra event data.
 */
function send(sendEvent, eventType, hit, eventName) {
  return () => sendEvent(eventType, hit, eventName);
}

const testSuites = {
  createHitsWidgetTests,
  createInstantSearchWidgetTests,
  createPaginationWidgetTests,
  createRefinementListWidgetTests,
  createSearchBoxWidgetTests,
};

const testSetups = {
  async createSearchBoxWidgetTests({ instantSearchOptions, widgetParams }) {
    await render(
      <template>
        <Root @options={{@options}} as |ais|>
          <ais.Widget @widget={{searchBox}} @params={{@params}} />
        </Root>
      </template>,
      { options: instantSearchOptions, params: widgetParams }
    );
  },

  async createHitsWidgetTests({ instantSearchOptions, widgetParams }) {
    await render(
      <template>
        <Root @options={{@options}} as |ais|>
          <ais.Widget @widget={{searchBox}} />
          <ais.Hits
            id="main-hits"
            @escapeHTML={{@params.escapeHTML}}
            @transformItems={{@params.transformItems}}
            as |hit sendEvent|
          >
            <div data-testid="main-hits-top-level-{{hit.__position}}">
              {{hit.objectID}}
              <button
                type="button"
                data-testid="main-hits-convert-{{hit.__position}}"
                {{on "click" (send sendEvent "conversion" hit "Converted")}}
              >convert</button>
              <button
                type="button"
                data-testid="main-hits-click-{{hit.__position}}"
                {{on "click" (send sendEvent "click" hit "Clicked")}}
              >click</button>
            </div>
          </ais.Hits>
          <div id="hits-with-defaults">
            <ais.Hits
              @escapeHTML={{@params.escapeHTML}}
              @transformItems={{@params.transformItems}}
            />
          </div>
          <ais.Index @indexName="nested" as |nested|>
            <nested.Hits id="nested-hits" as |hit sendEvent|>
              <div data-testid="nested-hits-{{hit.__position}}">
                {{hit.objectID}}
                <button
                  type="button"
                  data-testid="nested-hits-click-{{hit.__position}}"
                  {{on "click" (send sendEvent "click" hit "Clicked nested")}}
                >click</button>
              </div>
            </nested.Hits>
          </ais.Index>
        </Root>
      </template>,
      { options: instantSearchOptions, params: widgetParams }
    );
  },

  async createRefinementListWidgetTests({
    instantSearchOptions,
    widgetParams,
  }) {
    await render(
      <template>
        <Root @options={{@options}} as |ais|>
          <ais.Widget @widget={{refinementList}} @params={{@params}} />
        </Root>
      </template>,
      { options: instantSearchOptions, params: widgetParams }
    );
  },

  async createPaginationWidgetTests({ instantSearchOptions, widgetParams }) {
    await render(
      <template>
        <Root @options={{@options}} as |ais|>
          <ais.Widget @widget={{pagination}} @params={{@params}} />
        </Root>
      </template>,
      { options: instantSearchOptions, params: widgetParams }
    );
  },

  async createInstantSearchWidgetTests({ instantSearchOptions }) {
    await render(
      <template><Root @options={{@options}} /></template>,
      { options: instantSearchOptions }
    );

    return {
      algoliaAgents: [
        `instantsearch.js (${instantSearchVersion})`,
        `ember-instantsearch (${version})`,
        `ember (${emberVersion})`,
      ],
    };
  },
};

const testOptions = {
  createHitsWidgetTests: { act },
  createInstantSearchWidgetTests: { act },
  createPaginationWidgetTests: { act },
  createRefinementListWidgetTests: { act },
  createSearchBoxWidgetTests: { act },
};

describe('Common widget tests (Ember InstantSearch)', () => {
  runTestSuites({
    flavor: 'ember',
    testSuites,
    testSetups,
    testOptions,
  });
});
