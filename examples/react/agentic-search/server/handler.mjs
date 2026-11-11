// Request handler for the fake backend: a fixture search engine and a
// scripted agent. Agent Studio mode needs no server (the browser talks to
// Algolia directly). Mounted by the Vite dev server in fake mode (see
// vite.config.mjs) and by the standalone `server/index.mjs`.
//
//   POST /search        { requests: [{ indexName, params }] } → { results }
//   POST /agent/stream  { queries: string[], filters: { [attr]: string[] },
//                         exclude?: string[] }
//                       → ai-lite UI message stream (SSE)

import { AGENT_STREAM_PATH, search } from './search.mjs';
import { isValidAgentBody, playTurn } from './stream.mjs';

function readJson(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
    });
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res, status, body) {
  res.writeHead(status, { 'content-type': 'application/json' });
  res.end(JSON.stringify(body));
}

function streamAgent(req, res, body) {
  res.writeHead(200, {
    'content-type': 'text/event-stream',
    'cache-control': 'no-cache',
    connection: 'keep-alive',
    'x-vercel-ai-ui-message-stream': 'v1',
  });
  const stop = playTurn(body, {
    write: (frame) => res.write(frame),
    end: () => res.end(),
  });
  // The client aborts the request when the user sends a follow-up or changes
  // a filter; stop writing as soon as that happens.
  res.on('close', stop);
}

/**
 * Connect-style middleware: handles the fake endpoints, calls `next()` for
 * anything else (or answers 404 when used standalone).
 */
export function handler(req, res, next) {
  const path = (req.url || '').split('?')[0];
  const isSearch = path === '/search';
  const isAgent = path === AGENT_STREAM_PATH;

  if (!isSearch && !isAgent) {
    if (next) next();
    else sendJson(res, 404, { message: 'Not found' });
    return;
  }

  if (req.method !== 'POST') {
    sendJson(res, 405, { message: 'Use POST' });
    return;
  }

  readJson(req).then(
    (body) => {
      if (isSearch) {
        const respond = (error) =>
          sendJson(res, 500, { message: String(error?.message || error) });
        // A little latency so the loading states are visible.
        setTimeout(() => {
          try {
            sendJson(res, 200, search(body));
          } catch (error) {
            respond(error);
          }
        }, 120);
        return;
      }
      if (!isValidAgentBody(body)) {
        sendJson(res, 400, {
          message: 'Expected { queries: string[], filters?: object }',
        });
        return;
      }
      streamAgent(req, res, body);
    },
    () => sendJson(res, 400, { message: 'Invalid JSON body' })
  );
}
