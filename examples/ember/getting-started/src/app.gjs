import { hash } from '@ember/helper';
import { liteClient as algoliasearch } from 'algoliasearch/lite';
import {
  connectConfigure,
  connectHits,
} from 'instantsearch.js/es/connectors/index';
import { pagination, refinementList, searchBox } from 'instantsearch.js/es/widgets/index';

import { Highlight, InstantSearch } from 'ember-instantsearch';

const searchClient = algoliasearch(
  'latency',
  '6be0576ff61c053d5f9a3225e2a90f76'
);

export const App = <template>
  <header class="header">
    <h1 class="header-title">
      <a href="/">Getting started</a>
    </h1>
    <p class="header-subtitle">
      using
      <a
        href="https://github.com/algolia/instantsearch/tree/master/packages/ember-instantsearch"
      >Ember InstantSearch</a>
    </p>
  </header>

  <div class="container">
    <InstantSearch
      @searchClient={{searchClient}}
      @indexName="instant_search"
      @insights={{true}}
      as |ais|
    >
      <ais.Connector
        @connector={{connectConfigure}}
        @params={{hash searchParameters=(hash hitsPerPage=8)}}
      />
      <div class="search-panel">
        <div class="search-panel__filters">
          <div class="ais-Panel">
            <div class="ais-Panel-header"><span>brand</span></div>
            <div class="ais-Panel-body">
              <ais.Widget
                @widget={{refinementList}}
                @params={{hash attribute="brand"}}
              />
            </div>
          </div>
          <div class="ais-Panel">
            <div class="ais-Panel-header"><span>categories</span></div>
            <div class="ais-Panel-body">
              <ais.Widget
                @widget={{refinementList}}
                @params={{hash attribute="categories"}}
              />
            </div>
          </div>
        </div>

        <div class="search-panel__results">
          <ais.Widget
            @widget={{searchBox}}
            @params={{hash cssClasses=(hash root="searchbox")}}
          />
          <ais.Connector @connector={{connectHits}} as |state|>
            <div class="ais-Hits">
              <ol class="ais-Hits-list">
                {{#each state.items key="objectID" as |hit|}}
                  <li class="ais-Hits-item">
                    <article>
                      <h1>
                        <Highlight @hit={{hit}} @attribute="name" />
                      </h1>
                      <p>
                        <Highlight @hit={{hit}} @attribute="description" />
                      </p>
                    </article>
                  </li>
                {{/each}}
              </ol>
            </div>
          </ais.Connector>

          <div class="pagination">
            <ais.Widget @widget={{pagination}} />
          </div>
        </div>
      </div>
    </InstantSearch>
  </div>
</template>;
