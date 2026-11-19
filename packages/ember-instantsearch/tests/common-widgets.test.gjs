import { hash } from '@ember/helper';
import { VERSION as emberVersion } from '@ember/version';
import { runTestSuites } from '@instantsearch/tests/common';
import { createHitsWidgetTests } from '@instantsearch/tests/widgets/hits';
import { createInstantSearchWidgetTests } from '@instantsearch/tests/widgets/instantsearch';
import { createPaginationWidgetTests } from '@instantsearch/tests/widgets/pagination';
import { createRefinementListWidgetTests } from '@instantsearch/tests/widgets/refinement-list';
import { createSearchBoxWidgetTests } from '@instantsearch/tests/widgets/search-box';
import instantSearchVersion from 'instantsearch.js/es/lib/version';
import {
  hits,
  pagination,
  refinementList,
  searchBox,
} from 'instantsearch.js/es/widgets/index';

import { version } from 'ember-instantsearch';

import { act, render } from './-support/render.ts';
import { Root } from './-support/root.gjs';

/**
 * The suites in `tests/common` that Ember InstantSearch has widgets for.
 * The other flavors run all of them.
 */
function withTemplates(params, templates) {
  return Object.assign({ templates }, params);
}

const mainHitsTemplates = {
  item: (hit, { html, sendEvent }) =>
    html`<div data-testid=${`main-hits-top-level-${hit.__position}`}>
      ${hit.objectID}
      <button
        data-testid=${`main-hits-convert-${hit.__position}`}
        onClick=${() => sendEvent('conversion', hit, 'Converted')}
      >
        convert
      </button>
      <button
        data-testid=${`main-hits-click-${hit.__position}`}
        onClick=${() => sendEvent('click', hit, 'Clicked')}
      >
        click
      </button>
    </div>`,
};

const nestedHitsTemplates = {
  item: (hit, { html, sendEvent }) =>
    html`<div data-testid=${`nested-hits-${hit.__position}`}>
      ${hit.objectID}
      <button
        data-testid=${`nested-hits-click-${hit.__position}`}
        onClick=${() => sendEvent('click', hit, 'Clicked nested')}
      >
        click
      </button>
    </div>`,
};

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
          <div id="main-hits">
            <ais.Widget
              @widget={{hits}}
              @params={{withTemplates @params mainHitsTemplates}}
            />
          </div>
          <div id="hits-with-defaults">
            <ais.Widget @widget={{hits}} @params={{@params}} />
          </div>
          <ais.Index @indexName="nested" as |nested|>
            <div id="nested-hits">
              <nested.Widget
                @widget={{hits}}
                @params={{hash templates=nestedHitsTemplates}}
              />
            </div>
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
  createHitsWidgetTests: {
    act,
    /**
     * Hits is the InstantSearch.js widget, which shows its default
     * `empty` template ("No results"), as in the InstantSearch.js suite.
     */
    skippedTests: { 'common rendering': true },
  },
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
