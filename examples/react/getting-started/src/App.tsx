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
  FilterSuggestions,
  CurrentRefinements,
} from 'react-instantsearch';

import { Panel } from './Panel';

import 'instantsearch.css/themes/satellite.css';

import './App.css';

const searchClient = algoliasearch(
  'latency',
  '6be0576ff61c053d5f9a3225e2a90f76'
);

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const TOOL_OUTPUT_STEP_DELAY_MS = 900;

const normalizeToolOutputEvent = (event: any): any => {
  if (event?.type !== 'tool-output-available' || !event.output) {
    return event;
  }

  const output = event.output as Record<string, any>;

  if (Array.isArray(output.hits)) {
    return event;
  }

  if (
    Array.isArray(output.results) &&
    output.results.length > 0 &&
    Array.isArray(output.results[0]?.hits)
  ) {
    const hits = output.results[0].hits;
    return {
      ...event,
      output: {
        ...output,
        hits,
        nbHits: output.nbHits ?? hits.length,
      },
    };
  }

  return event;
};

const getProgressiveToolOutputEvents = (event: any): any[] => {
  if (event?.type !== 'tool-output-available' || !event.output) {
    return [];
  }

  const output = event.output as Record<string, any>;

  if (Array.isArray(output.hits) && output.hits.length > 1) {
    return output.hits.slice(0, -1).map((_: any, index: number) => ({
      ...event,
      preliminary: true,
      output: {
        ...output,
        hits: output.hits.slice(0, index + 1),
      },
    }));
  }

  if (Array.isArray(output.results) && output.results.length > 0) {
    const firstResultWithHitsIndex = output.results.findIndex(
      (result: any) => Array.isArray(result?.hits) && result.hits.length > 1
    );

    if (firstResultWithHitsIndex === -1) {
      return [];
    }

    const hits = output.results[firstResultWithHitsIndex].hits;
    return hits.slice(0, -1).map((_: any, index: number) => ({
      ...event,
      preliminary: true,
      output: {
        ...output,
        results: output.results.map((result: any, resultIndex: number) =>
          resultIndex === firstResultWithHitsIndex
            ? {
                ...result,
                hits: hits.slice(0, index + 1),
              }
            : result
        ),
      },
    }));
  }

  return [];
};

const delayedChatFetch: typeof fetch = async (input, init) => {
  const response = await fetch(input, init);

  const isEventStream =
    response.headers.get('content-type')?.includes('text/event-stream') ??
    false;

  if (!response.body || !isEventStream) {
    return response;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let hasInjectedOutputDelay = false;
  let pendingText = '';

  const delayedBody = new ReadableStream<Uint8Array>({
    async start(controller) {
      const emitLine = async (line: string): Promise<void> => {
        if (!line.startsWith('data: ')) {
          controller.enqueue(encoder.encode(line));
          return;
        }

        const payload = line.slice(6).trim();
        if (payload === '[DONE]') {
          controller.enqueue(encoder.encode(line));
          return;
        }

        let parsedEvent: any;
        try {
          parsedEvent = JSON.parse(payload);
        } catch {
          controller.enqueue(encoder.encode(line));
          return;
        }

        if (
          !hasInjectedOutputDelay &&
          parsedEvent?.type === 'tool-output-available'
        ) {
          const normalizedToolOutputEvent =
            normalizeToolOutputEvent(parsedEvent);
          const progressiveEvents = getProgressiveToolOutputEvents(
            normalizedToolOutputEvent
          );

          if (progressiveEvents.length > 0) {
            hasInjectedOutputDelay = true;

            const emitProgressiveOutput = (index: number): Promise<void> => {
              if (index >= progressiveEvents.length) {
                controller.enqueue(
                  encoder.encode(
                    `data: ${JSON.stringify(normalizedToolOutputEvent)}\n`
                  )
                );
                controller.enqueue(encoder.encode('\n'));
                return Promise.resolve();
              }

              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify(progressiveEvents[index])}\n`
                )
              );
              controller.enqueue(encoder.encode('\n'));

              return sleep(TOOL_OUTPUT_STEP_DELAY_MS).then(() =>
                emitProgressiveOutput(index + 1)
              );
            };

            return emitProgressiveOutput(0);
          }
        }

        controller.enqueue(encoder.encode(line));
      };

      const processPendingLines = (): Promise<void> => {
        const lineBreakIndex = pendingText.indexOf('\n');
        if (lineBreakIndex === -1) {
          return Promise.resolve();
        }

        const line = pendingText.slice(0, lineBreakIndex + 1);
        pendingText = pendingText.slice(lineBreakIndex + 1);

        return emitLine(line).then(() => processPendingLines());
      };

      const pump = (): Promise<void> =>
        reader.read().then(({ done, value }) => {
          if (done) {
            if (pendingText) {
              controller.enqueue(encoder.encode(pendingText));
            }
            controller.close();
            return Promise.resolve();
          }

          if (!value) {
            return pump();
          }

          pendingText += decoder.decode(value, { stream: true });
          return processPendingLines().then(() => pump());
        });

      try {
        await pump();
      } catch (error) {
        controller.error(error);
      } finally {
        reader.releaseLock();
      }
    },
  });

  return new Response(delayedBody, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });
};

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
              <SearchBox placeholder="" className="searchbox" />
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
            itemComponent={ItemComponent}
            transport={{
              fetch: delayedChatFetch,
            }}
          />
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
