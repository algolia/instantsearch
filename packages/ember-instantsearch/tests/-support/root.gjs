import { InstantSearch } from 'ember-instantsearch';

/**
 * The shared suites assert on errors through the DOM,
 * so an `error` listener keeps InstantSearch from throwing them.
 * The setups of the other flavors do the same.
 */
function swallowErrors(search) {
  search.on('error', () => {});
}

/**
 * `<InstantSearch>` with the options of a shared suite.
 */
export const Root = <template>
  <InstantSearch
    @searchClient={{@options.searchClient}}
    @indexName={{@options.indexName}}
    @compositionID={{@options.compositionID}}
    @initialUiState={{@options.initialUiState}}
    @routing={{@options.routing}}
    @insights={{@options.insights}}
    @insightsClient={{@options.insightsClient}}
    @onStateChange={{@options.onStateChange}}
    @searchFunction={{@options.searchFunction}}
    @stalledSearchDelay={{@options.stalledSearchDelay}}
    @future={{@options.future}}
    as |ais|
  >
    {{swallowErrors ais.search}}
    {{yield ais}}
  </InstantSearch>
</template>;
