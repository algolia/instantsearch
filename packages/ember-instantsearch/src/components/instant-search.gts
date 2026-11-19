import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { registerDestructor } from '@ember/destroyable';
import { hash } from '@ember/helper';
import { VERSION as emberVersion } from '@ember/version';
import InstantSearchCore, {
  INSTANTSEARCH_FUTURE_DEFAULTS,
} from 'instantsearch.js/es/lib/InstantSearch';
import { isEqual } from 'instantsearch.js/es/lib/utils/isEqual';

import { definedOnly } from '../-private/use-widget.ts';
import version from '../version.ts';
import Configure from './configure.gts';
import Connector from './connector.gts';
import Hits from './hits.gts';
import Index from './index-widget.gts';
import Pagination from './pagination.gts';
import RefinementList from './refinement-list.gts';
import SearchBox from './search-box.gts';

import type { Parent } from '../types.ts';
import type Owner from '@ember/owner';
import type { Yielded } from '../-private/yielded.ts';
import type {
  CompositionClient,
  InstantSearchOptions,
  SearchClient,
} from 'instantsearch.js';

export interface InstantSearchSignature {
  Args: InstantSearchOptions;
  Blocks: {
    default: [Yielded];
  };
}

const userAgents = [
  `ember (${emberVersion})`,
  `ember-instantsearch (${version})`,
];

function addAlgoliaAgents(searchClient: SearchClient | CompositionClient) {
  if (typeof searchClient.addAlgoliaAgent !== 'function') return;

  for (let i = 0; i < userAgents.length; i++) {
    searchClient.addAlgoliaAgent(userAgents[i]!);
  }
}

/**
 * The root of an Ember InstantSearch UI.
 *
 * It owns one InstantSearch.js instance and yields the widgets,
 * already bound to the main index.
 *
 * @example
 * ```gjs
 * <InstantSearch @searchClient={{searchClient}} @indexName="instant_search" as |ais|>
 *   <ais.SearchBox />
 *   <ais.Hits as |hit|>{{hit.name}}</ais.Hits>
 * </InstantSearch>
 * ```
 */
export default class InstantSearch extends Component<InstantSearchSignature> {
  /**
   * The options that the instance has now,
   * so that a change of argument applies only once.
   */
  #applied = this.#options();

  search = new InstantSearchCore(this.#applied);

  #parentObject: Parent = {
    search: this.search,
    index: this.search.mainIndex,
  };

  constructor(owner: Owner, args: InstantSearchSignature['Args']) {
    super(owner, args);

    addAlgoliaAgents(this.#applied.searchClient);

    /**
     * Starting here, before the block renders, lets each widget
     * run `init` as it joins and render its first state at once,
     * the same as React InstantSearch.
     * The widgets that join in this render share one search.
     */
    this.search.start();

    registerDestructor(this, () => {
      this.search.dispose();
    });
  }

  #options(): InstantSearchOptions {
    const { args } = this;

    return definedOnly({
      searchClient: args.searchClient,
      indexName: args.indexName,
      compositionID: args.compositionID,
      initialUiState: args.initialUiState,
      routing: args.routing,
      insights: args.insights,
      insightsClient: args.insightsClient,
      onStateChange: args.onStateChange,
      searchFunction: args.searchFunction,
      stalledSearchDelay: args.stalledSearchDelay,
      future: args.future,
    }) as InstantSearchOptions;
  }

  /**
   * Applies the arguments that can change after the first render.
   *
   * The object that it returns never changes,
   * so the widgets below stay mounted.
   *
   * `routing` and `initialUiState` apply only once, as in the other flavors.
   */
  @cached
  get parent(): Parent {
    const next = this.#options();
    const applied = this.#applied;
    const { search } = this;

    if (next.searchClient !== applied.searchClient) {
      addAlgoliaAgents(next.searchClient);
      search.mainHelper!.setClient(next.searchClient).search();
    }

    if (next.indexName !== applied.indexName) {
      search.helper!.setIndex(next.indexName || '').search();
    }

    if (next.onStateChange !== applied.onStateChange) {
      search.onStateChange = next.onStateChange;
    }

    if (next.searchFunction !== applied.searchFunction) {
      search._searchFunction = next.searchFunction;
    }

    if (next.stalledSearchDelay !== applied.stalledSearchDelay) {
      search._stalledSearchDelay = next.stalledSearchDelay ?? 200;
    }

    if (!isEqual(next.future, applied.future)) {
      search.future = Object.assign(
        {},
        INSTANTSEARCH_FUTURE_DEFAULTS,
        next.future
      );
    }

    this.#applied = next;

    return this.#parentObject;
  }

  <template>
    {{yield
      (hash
        search=this.parent.search
        index=this.parent.index
        Configure=(component Configure parent=this.parent)
        Connector=(component Connector parent=this.parent)
        Hits=(component Hits parent=this.parent)
        Index=(component Index parent=this.parent)
        Pagination=(component Pagination parent=this.parent)
        RefinementList=(component RefinementList parent=this.parent)
        SearchBox=(component SearchBox parent=this.parent)
      )
    }}
  </template>
}
