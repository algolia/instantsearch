import { liteClient as algoliasearch } from 'algoliasearch/lite';
import { Hit } from 'instantsearch.js';
import React from 'react';
import {
  Configure,
  Highlight,
  Hits,
  InstantSearch,
  Pagination,
  RefinementList,
  SearchBox,
  TrendingItems,
  Carousel,
  Chat,
  ChatTrigger,
  FilterSuggestions,
  PromptSuggestions,
  CurrentRefinements,
} from 'react-instantsearch';

import { Panel } from './Panel';
import { SearchSummary } from './SearchSummary';
import { TaskDemo } from './TaskDemo';

import 'instantsearch.css/themes/satellite.css';

import './App.css';

const searchClient = algoliasearch(
  'latency',
  '6be0576ff61c053d5f9a3225e2a90f76'
);

// The connected `<PromptSuggestions>` requires a real prompt-suggestions
// configuration id (none ships with the examples). Paste one here to see it
// derive its context from the live search state and resolve credentials from
// the search client — the in-InstantSearch counterpart of the standalone widget
// in `TaskDemo`.
const PROMPT_SUGGESTIONS_CONFIGURATION_ID: string = '';

// The generic `createTaskConnector` demo (`SearchSummary`) also needs a real
// task id. Paste one to see the connected generic-task API auto-refetch off the
// live search query — the in-InstantSearch counterpart of the `useTask` hook.
const SEARCH_SUMMARY_TASK_ID: string = '';

export function App() {
  return (
    <div>
      <header className="header">
        <h1 className="header-title">
          <a href="/">Getting started</a>
        </h1>
        <p className="header-subtitle">
          using{' '}
          <a href="https://github.com/algolia/instantsearch/tree/master/packages/react-instantsearch">
            React InstantSearch
          </a>
        </p>
      </header>

      <TaskDemo />

      <div className="container">
        <InstantSearch
          searchClient={searchClient}
          indexName="instant_search"
          insights={true}
        >
          <Configure hitsPerPage={8} />
          <div className="search-panel">
            <div className="search-panel__filters">
              <Panel header="brand">
                <RefinementList attribute="brand" />
              </Panel>
              <Panel header="categories">
                <RefinementList attribute="categories" />
              </Panel>
            </div>

            <div className="search-panel__results">
              <SearchBox placeholder="" className="searchbox" aiMode />
              <Panel
                header="Current Refinements"
                hidden={(state) =>
                  state.currentRefinements?.items?.length === 0
                }
              >
                <CurrentRefinements />
              </Panel>
              <Panel header="Filter Suggestions">
                <FilterSuggestions
                  agentId="3123062d-d611-4d4f-8ab2-4fa39302dc64"
                  attributes={['brand', 'categories']}
                  headerComponent={false}
                />
              </Panel>
              {PROMPT_SUGGESTIONS_CONFIGURATION_ID && (
                <Panel header="Prompt Suggestions (connected)">
                  <PromptSuggestions
                    agentId="eedef238-5468-470d-bc37-f99fa741bd25"
                    configurationId={PROMPT_SUGGESTIONS_CONFIGURATION_ID}
                    // Connected: hand the prompt to the chat widget, falling
                    // back to an alert if chat isn't mounted/ready.
                    onSuggestionClick={(prompt, { sendToChat }) => {
                      if (!sendToChat(prompt)) {
                        window.alert(prompt);
                      }
                    }}
                  />
                </Panel>
              )}
              {SEARCH_SUMMARY_TASK_ID && (
                <Panel header="Search Summary (generic task connector)">
                  <SearchSummary
                    agentId="eedef238-5468-470d-bc37-f99fa741bd25"
                    task={SEARCH_SUMMARY_TASK_ID}
                  />
                </Panel>
              )}
              <Hits hitComponent={HitComponent} />

              <div className="pagination">
                <Pagination />
              </div>
              <div>
                <TrendingItems
                  itemComponent={ItemComponent}
                  limit={6}
                  layoutComponent={Carousel}
                />
              </div>
            </div>
          </div>

          <Chat
            agentId="eedef238-5468-470d-bc37-f99fa741bd25"
            feedback={true}
            itemComponent={ItemComponent}
          />
          <ChatTrigger />
        </InstantSearch>
      </div>
    </div>
  );
}

type HitType = Hit<{
  image: string;
  name: string;
  description: string;
}>;

function HitComponent({ hit }: { hit: HitType }) {
  return (
    <article>
      <h1>
        <a href={`/products.html?pid=${hit.objectID}`}>
          <Highlight attribute="name" hit={hit} />
        </a>
      </h1>
      <p>
        <Highlight attribute="description" hit={hit} />
      </p>
      <a href={`/products.html?pid=${hit.objectID}`}>See product</a>
    </article>
  );
}

function ItemComponent({ item }: { item: Hit }) {
  return (
    <article className="ais-Carousel-hit">
      <div className="ais-Carousel-hit-image">
        <img src={item.image} />
      </div>
      <h2 className="ais-Carousel-hit-title">
        <a
          href={`/products.html?pid=${item.objectID}`}
          className="ais-Carousel-hit-link"
        >
          {item.name}
        </a>
      </h2>
    </article>
  );
}
