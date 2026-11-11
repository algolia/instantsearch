// The fake agent turn as a timeline, shared by the Node server
// (server/handler.mjs) and the in-browser build (src/fake/inlineBackend.ts).

import { script, shouldFail, toTokens } from './agent.mjs';

const DELAYS = {
  token: 35,
  pause: 350,
  hits: 220,
};

export function isValidAgentBody(body) {
  return Boolean(
    body &&
    Array.isArray(body.queries) &&
    body.queries.length > 0 &&
    body.queries.every((query) => typeof query === 'string') &&
    (body.exclude === undefined ||
      (Array.isArray(body.exclude) &&
        body.exclude.every((objectID) => typeof objectID === 'string'))) &&
    (body.filters === undefined ||
      (typeof body.filters === 'object' && !Array.isArray(body.filters)))
  );
}

/** The whole turn as `[delay before, chunk]` steps. */
export function turnSteps(body) {
  const turn = script({
    queries: body.queries,
    filters: body.filters || {},
    exclude: body.exclude,
  });

  const steps = [
    [0, { type: 'start', messageId: `msg-${Date.now().toString(36)}` }],
  ];
  turn.reasoning.forEach((line) => {
    toTokens(`${line} `).forEach((token, index) => {
      steps.push([
        index === 0 ? DELAYS.pause : DELAYS.token,
        { type: 'data-reasoning', data: { text: token } },
      ]);
    });
  });

  if (shouldFail(body)) {
    steps.push([
      DELAYS.pause,
      {
        type: 'error',
        errorText:
          'The agent timed out while searching (scripted failure). Retry to try again.',
      },
    ]);
    return steps;
  }

  toTokens(turn.answer).forEach((token, index) => {
    steps.push([
      index === 0 ? DELAYS.pause : DELAYS.token,
      { type: 'data-agent-text', data: { text: token } },
    ]);
  });
  for (let i = 0; i < turn.hits.length; i += 2) {
    steps.push([
      DELAYS.hits,
      { type: 'data-hits', data: { hits: turn.hits.slice(i, i + 2) } },
    ]);
  }
  if (turn.more.length > 0) {
    steps.push([0, { type: 'data-more-hits', data: { hits: turn.more } }]);
  }
  steps.push([0, { type: 'data-metadata', data: turn.metadata }]);
  steps.push([0, { type: 'finish' }]);
  return steps;
}

/**
 * Plays a turn as SSE frames: `write` gets each `data: …` frame, `end` is
 * called once at the end. Returns a function that stops playback (the client
 * aborted: a follow-up or a filter change).
 */
export function playTurn(body, { write, end }) {
  const steps = turnSteps(body);
  let stopped = false;
  let timer;

  const play = (index) => {
    if (stopped) return;
    if (index === steps.length) {
      write('data: [DONE]\n\n');
      end();
      return;
    }
    const [delay, chunk] = steps[index];
    timer = setTimeout(() => {
      if (stopped) return;
      write(`data: ${JSON.stringify(chunk)}\n\n`);
      play(index + 1);
    }, delay);
  };

  play(0);
  return () => {
    stopped = true;
    clearTimeout(timer);
  };
}
