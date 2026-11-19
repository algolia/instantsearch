import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { runTestSuites } from '@instantsearch/tests/common';
import { createPaginationConnectorTests } from '@instantsearch/tests/connectors/pagination';
import { createRefinementListConnectorTests } from '@instantsearch/tests/connectors/refinement-list';
import {
  connectPagination,
  connectRefinementList,
} from 'instantsearch.js/es/connectors/index';

import { act, render } from './-support/render.ts';
import { Root } from './-support/root.gjs';

/**
 * The suites in `tests/common/connectors` that Ember InstantSearch runs.
 * They render a custom UI with `<ais.Connector>`, as an app would.
 */
const testSuites = {
  createPaginationConnectorTests,
  createRefinementListConnectorTests,
};

function refineFromInput(state, event) {
  event.preventDefault();
  state.refine(event.currentTarget.elements[0].value);
}

function togglePage(state) {
  state.refine(state.currentRefinement === 0 ? 1 : 0);
}

function refinementListParams(params) {
  return { attribute: params.attribute };
}

const testSetups = {
  async createRefinementListConnectorTests({
    instantSearchOptions,
    widgetParams,
  }) {
    await render(
      <template>
        <Root @options={{@options}} as |ais|>
          <ais.Connector
            @connector={{connectRefinementList}}
            @params={{refinementListParams @params}}
            as |state|
          >
            <div>
              <a
                data-testid="RefinementList-link"
                href={{state.createURL "value"}}
              >LINK</a>
              <form {{on "submit" (fn refineFromInput state)}}>
                <input type="text" data-testid="RefinementList-refine-input" />
              </form>
            </div>
          </ais.Connector>
        </Root>
      </template>,
      { options: instantSearchOptions, params: widgetParams }
    );
  },

  async createPaginationConnectorTests({ instantSearchOptions }) {
    await render(
      <template>
        <Root @options={{@options}} as |ais|>
          <ais.Connector @connector={{connectPagination}} as |state|>
            <div>
              <a
                data-testid="Pagination-link"
                href={{state.createURL 10}}
              >LINK</a>
              <button
                type="button"
                data-testid="Pagination-refine"
                {{on "click" (fn togglePage state)}}
              >REFINE</button>
            </div>
          </ais.Connector>
        </Root>
      </template>,
      { options: instantSearchOptions }
    );
  },
};

const testOptions = {
  createPaginationConnectorTests: { act },
  createRefinementListConnectorTests: { act },
};

describe('Common connector tests (Ember InstantSearch)', () => {
  runTestSuites({
    flavor: 'ember',
    testSuites,
    testSetups,
    testOptions,
  });
});
