import {
  HttpChatTransport,
  parseJsonEventStream,
} from 'instantsearch.js/es/lib/ai-lite';

import { getQueries } from './chat';

import type { AgentMessage } from './chat';
import type { Filters, Product } from '../types';
import type {
  InferUIMessageChunk,
  UIMessageChunk,
} from 'instantsearch.js/es/lib/ai-lite';

type AgentChunk = InferUIMessageChunk<AgentMessage>;

export type AgentStudioOptions = {
  appId: string;
  apiKey: string;
  indexName: string;
  agentId: string;
  getFilters: () => Filters;
  /**
   * Agent Studio caches completions by default. A cached replay has no
   * reasoning and arrives as one text chunk, and the demo repeats prompts.
   */
  cache?: boolean;
};

/** "Show more" candidates sent per turn. */
const MAX_MORE_HITS = 18;

function describeFilters(filters: Filters) {
  return Object.entries(filters)
    .filter(([, values]) => values.length > 0)
    .map(([attribute, values]) => `${attribute} is ${values.join(' or ')}`)
    .join('; ');
}

/**
 * Stateless request: every query is a user message, and the active filters
 * (and, for "Ask for more", the products already on screen) ride along on
 * the last one. Agent replies are not sent back.
 */
function toAgentStudioMessages(
  queries: string[],
  filters: Filters,
  exclude: string[]
) {
  const filterText = describeFilters(filters);
  const context = [
    filterText && `Active filters: ${filterText}`,
    exclude.length > 0 &&
      `Already shown, pick different products: ${exclude.join(', ')}`,
  ].filter(Boolean);
  return queries.map((query, index) => ({
    id: `q${index}`,
    role: 'user' as const,
    parts: [
      {
        type: 'text' as const,
        text:
          index === queries.length - 1 && context.length > 0
            ? `${query}\n\n${context.join('\n')}`
            : query,
      },
    ],
  }));
}

const isSearchTool = (name = '') => name.startsWith('algolia_search_index');
const isPicksTool = (name = '') =>
  name === 'algolia_grouped_results' || name === 'algolia_display_results';

function describeSearch(query: Record<string, unknown>) {
  const facets = Object.entries(query)
    .filter(
      ([key, value]) =>
        key.startsWith('facet_') && Array.isArray(value) && value.length > 0
    )
    .map(
      ([key, value]) =>
        `${key.slice('facet_'.length)}: ${(value as string[]).join(', ')}`
    );
  const text = typeof query.query === 'string' ? query.query : '';
  return `Searching “${text}”${facets.length > 0 ? ` (${facets.join('; ')})` : ''}.`;
}

/**
 * Talks to an Agent Studio agent straight from the browser (with a
 * search-only key, like the Chat widget) and translates its AI SDK 5 stream
 * into this example's agent protocol:
 *
 * - search tool calls and their hit counts → `data-reasoning` lines;
 * - the model's own reasoning → `data-reasoning`;
 * - the results tool's picked objectIDs → `data-hits`, using the records the
 *   searches returned;
 * - the other records the searches returned → `data-more-hits`;
 * - text → `data-agent-text`.
 */
export class AgentStudioTransport extends HttpChatTransport<AgentMessage> {
  private readonly options: AgentStudioOptions;
  private readonly request: { exclude: string[] };

  constructor(options: AgentStudioOptions) {
    // Per-request state, filled by `prepareSendMessagesRequest` and read by
    // `processResponseStream`. Requests never overlap: ai-lite runs them one
    // after another.
    const request = { exclude: [] as string[] };
    super({
      api: `https://${options.appId}.algolia.net/agent-studio/1/agents/${options.agentId}/completions?compatibilityMode=ai-sdk-5&memory=false&cache=${options.cache ?? false}`,
      headers: {
        'x-algolia-application-id': options.appId,
        'x-algolia-api-key': options.apiKey,
      },
      prepareSendMessagesRequest: ({ messages, body }) => {
        request.exclude = Array.isArray(body?.exclude)
          ? (body.exclude as string[])
          : [];
        return {
          body: {
            messages: toAgentStudioMessages(
              getQueries(messages),
              options.getFilters(),
              request.exclude
            ),
          },
        };
      },
    });
    this.options = options;
    this.request = request;
  }

  private getObjects(objectIDs: string[]): Promise<Product[]> {
    if (objectIDs.length === 0) return Promise.resolve([]);
    const { appId, apiKey, indexName } = this.options;
    return fetch(`https://${appId}-dsn.algolia.net/1/indexes/*/objects`, {
      method: 'POST',
      headers: {
        'x-algolia-application-id': appId,
        'x-algolia-api-key': apiKey,
      },
      body: JSON.stringify({
        requests: objectIDs.map((objectID) => ({ indexName, objectID })),
      }),
    })
      .then((response) => response.json())
      .then(({ results }: { results: Array<Product | null> }) =>
        results.filter((hit): hit is Product => hit !== null)
      );
  }

  protected processResponseStream(
    stream: ReadableStream<Uint8Array>
  ): ReadableStream<AgentChunk> {
    // Every record the agent's searches returned, in arrival order: picks are
    // filled in from it and the rest become "Show more" candidates.
    const records = new Map<string, Product>();
    const shown = new Set(this.request.exclude);
    const searches: string[] = [];
    // Model reasoning gets its own paragraph; consecutive action lines stay
    // together.
    let lastReasoning: 'model' | 'action' | 'start' | null = null;

    const reason = (
      controller: TransformStreamDefaultController<AgentChunk>,
      kind: 'model' | 'action',
      text: string
    ) => {
      const separator =
        lastReasoning === null
          ? ''
          : kind === 'action' && lastReasoning === 'action'
            ? '\n'
            : '\n\n';
      lastReasoning = kind;
      controller.enqueue({
        type: 'data-reasoning',
        data: { text: separator + text },
      });
    };

    const translate = (
      chunk: UIMessageChunk,
      controller: TransformStreamDefaultController<AgentChunk>
    ): void | Promise<void> => {
      switch (chunk.type) {
        case 'start':
          controller.enqueue({ type: 'start', messageId: chunk.messageId });
          return undefined;
        case 'reasoning-start':
          lastReasoning = lastReasoning && 'start';
          return undefined;
        case 'reasoning-delta':
          if (lastReasoning === 'model') {
            controller.enqueue({
              type: 'data-reasoning',
              data: { text: chunk.delta },
            });
          } else {
            reason(controller, 'model', chunk.delta);
          }
          return undefined;
        case 'text-delta':
          controller.enqueue({
            type: 'data-agent-text',
            data: { text: chunk.delta },
          });
          return undefined;
        case 'tool-input-available': {
          const input = (chunk.input ?? {}) as {
            queries?: Array<Record<string, unknown>>;
            groups?: Array<{ results?: Array<{ objectID?: unknown }> }>;
          };
          if (isSearchTool(chunk.toolName)) {
            (input.queries ?? [input as Record<string, unknown>]).forEach(
              (query) => {
                searches.push(String(query.query ?? ''));
                reason(controller, 'action', describeSearch(query));
              }
            );
            return undefined;
          }
          if (!isPicksTool(chunk.toolName)) return undefined;
          const objectIDs = (input.groups ?? [])
            .flatMap((group) => group.results ?? [])
            .map((result) => result.objectID)
            .filter((id): id is string => typeof id === 'string');
          reason(
            controller,
            'action',
            `Picked ${objectIDs.length} products to show.`
          );
          return this.getObjects(
            objectIDs.filter((objectID) => !records.has(objectID))
          ).then((hits) => {
            hits.forEach((hit) => records.set(hit.objectID, hit));
            // The agent was told what's already on screen; drop repeats.
            const picked = objectIDs
              .filter((objectID) => !shown.has(objectID))
              .map((objectID) => records.get(objectID))
              .filter((hit): hit is Product => Boolean(hit));
            picked.forEach((hit) => shown.add(hit.objectID));
            for (let i = 0; i < picked.length; i += 2) {
              controller.enqueue({
                type: 'data-hits',
                data: { hits: picked.slice(i, i + 2) },
              });
            }
          });
        }
        case 'tool-output-available': {
          const hits = (chunk.output as { hits?: Product[] } | undefined)?.hits;
          if (Array.isArray(hits)) {
            hits.forEach((hit) => records.set(hit.objectID, hit));
            reason(controller, 'action', `Found ${hits.length} candidates.`);
          }
          return undefined;
        }
        case 'error':
          controller.enqueue(chunk);
          return undefined;
        case 'finish': {
          const more = [...records.values()]
            .filter((hit) => !shown.has(hit.objectID))
            .slice(0, MAX_MORE_HITS);
          if (more.length > 0) {
            controller.enqueue({
              type: 'data-more-hits',
              data: { hits: more },
            });
          }
          controller.enqueue({
            type: 'data-metadata',
            data: { agentId: this.options.agentId, searches },
          });
          controller.enqueue({ type: 'finish' });
          return undefined;
        }
        default:
          return undefined;
      }
    };

    return parseJsonEventStream<UIMessageChunk>(stream).pipeThrough(
      // `transform` may return a promise: the stream waits for it, so chunks
      // stay in order across the `getObjects` lookup.
      new TransformStream<UIMessageChunk, AgentChunk>({ transform: translate })
    );
  }
}
