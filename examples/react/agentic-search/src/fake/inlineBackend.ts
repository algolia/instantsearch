/**
 * The fake backend running in the page instead of a server, for builds that
 * can't make network requests (VITE_AGENTIC_BACKEND=inline). Same search
 * engine and scripted agent as `server/`, behind a search client and a
 * `fetch` that ai-lite's transport accepts.
 */
import { search } from '../../server/search.mjs';
import { isValidAgentBody, playTurn } from '../../server/stream.mjs';

import type { SearchClient } from 'instantsearch.js';

type SearchRequest = { indexName: string; params?: Record<string, unknown> };

export const inlineSearchClient = {
  search(requests: SearchRequest[]) {
    // A little latency so the loading states are visible.
    return new Promise((resolve) => {
      setTimeout(() => resolve(search({ requests })), 120);
    });
  },
} as unknown as SearchClient;

const abortError = () =>
  new DOMException('The request was aborted', 'AbortError');

/** Answers `POST /agent/stream` with the scripted turn as an SSE stream. */
export const inlineFetch: typeof fetch = (_input, init) => {
  const signal = init?.signal;
  if (signal?.aborted) return Promise.reject(abortError());

  let body: unknown;
  try {
    body = JSON.parse(String(init?.body ?? ''));
  } catch {
    body = undefined;
  }
  if (!isValidAgentBody(body)) {
    return Promise.resolve(
      new Response(JSON.stringify({ message: 'Invalid agent request' }), {
        status: 400,
        headers: { 'content-type': 'application/json' },
      })
    );
  }

  const encoder = new TextEncoder();
  let stop = () => {};
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      stop = playTurn(body, {
        write: (frame) => controller.enqueue(encoder.encode(frame)),
        end: () => controller.close(),
      });
      // A follow-up or a filter change aborts the turn, as a real request.
      signal?.addEventListener('abort', () => {
        stop();
        controller.error(abortError());
      });
    },
    cancel() {
      stop();
    },
  });

  return Promise.resolve(
    new Response(stream, {
      status: 200,
      headers: { 'content-type': 'text/event-stream' },
    })
  );
};
