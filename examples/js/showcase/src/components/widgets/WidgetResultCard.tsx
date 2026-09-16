import { resultCard } from 'instantsearch.js/es/widgets';

import { SHOWCASE_AGENT_ID } from '../../constants';
import { useWidget } from '../../hooks/useWidget';

type Transport = NonNullable<Parameters<typeof resultCard>[0]['transport']>;
type Chunk = Record<string, unknown>;
/** A chunk to stream, or a pause in milliseconds before the next one. */
type Step = Chunk | number;

const SUGGESTIONS = {
  type: 'data-suggestions',
  data: { suggestions: ['Which one is lightest?', 'Anything under $100?'] },
};

// Streams the text in deltas separated by `pause`, like a real agent would.
function textSteps(text: string, pause: number): Step[] {
  const id = 'text';
  return [
    { type: 'text-start', id },
    ...text
      .split(/(?<=\s)/)
      .flatMap((delta): Step[] => [{ type: 'text-delta', id, delta }, pause]),
    { type: 'text-end', id },
  ];
}

// A transport whose `fetch` never hits the network and instead streams the
// given script as an SSE response. With `failFirst`, the first request rejects
// so the Retry button has something to recover from.
function scriptedTransport(
  steps: Step[],
  { failFirst = false }: { failFirst?: boolean } = {}
): Transport {
  let attempts = 0;
  const encoder = new TextEncoder();

  const fetch: typeof globalThis.fetch = (_input, init) => {
    attempts += 1;
    if (failFirst && attempts === 1) {
      return Promise.reject(new Error('Scripted failure: retry to recover.'));
    }

    let cancelled = false;
    init?.signal?.addEventListener('abort', () => {
      cancelled = true;
    });

    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        const enqueue = (line: string) =>
          controller.enqueue(encoder.encode(`data: ${line}\n\n`));
        const run = (index: number) => {
          if (cancelled) return;
          if (index >= steps.length) {
            enqueue('[DONE]');
            controller.close();
            return;
          }
          const step = steps[index];
          if (typeof step === 'number') {
            setTimeout(() => run(index + 1), step);
            return;
          }
          enqueue(JSON.stringify(step));
          run(index + 1);
        };
        run(0);
      },
      cancel() {
        cancelled = true;
      },
    });

    return Promise.resolve(
      new Response(stream, {
        headers: { 'Content-Type': 'text/event-stream' },
      })
    );
  };

  return { api: 'showcase://result-card', fetch };
}

function ResultCardVariant({
  hint,
  transport,
}: {
  hint: string;
  transport?: Transport;
}) {
  const ref = useWidget((el) =>
    resultCard({
      container: el,
      agentId: SHOWCASE_AGENT_ID,
      ...(transport ? { transport } : {}),
    })
  );

  return (
    <div class="flex flex-col gap-3">
      <p class="text-xs text-neutral-500 dark:text-neutral-400">
        Shows for queries of two words or more; the enabling Rule is mocked in
        the search client. {hint}
      </p>
      <div ref={ref} />
    </div>
  );
}

export function WidgetResultCard() {
  return <ResultCardVariant hint="Answers come from the live agent." />;
}

// Scripted variants below ignore the query: the same answer streams for any
// query, so each state can be inspected at leisure. "Continue in chat" still
// hands the conversation off to the real chat on this index.

export function WidgetResultCardSlowStream() {
  return (
    <ResultCardVariant
      hint="Scripted: 2s of loading, then the answer streams word by word with suggestions."
      transport={scriptedTransport([
        { type: 'start' },
        2000,
        ...textSteps(
          'The **Pegasus** is the safest pick for daily runs: cushioned, durable, and the best value of the three. Choose the Vomero if you want more cushioning on long runs.',
          120
        ),
        SUGGESTIONS,
        { type: 'finish' },
      ])}
    />
  );
}

const LONG_ANSWER = `Here is how the top results compare:

- **Pegasus** — the all-rounder. Responsive foam, breathable upper, and it holds up past 500 miles.
- **Vomero** — maximum cushioning. Heavier, but the softest ride of the three for long, easy runs.
- **Structure** — stability shoe. Pick it if you overpronate or your knees complain after tempo work.
- **Streakfly** — racing flat. Light and fast, but not built for daily mileage.

If you run most days at an easy pace, start with the Pegasus. For recovery days or anything over 15 km, the Vomero is worth the extra weight.

You can read the [full sizing guide](https://www.algolia.com/) before ordering: these models run about half a size small.`;

export function WidgetResultCardLongAnswer() {
  return (
    <ResultCardVariant
      hint="Scripted: a long markdown answer with a link, to exercise the clipping and Show more/less."
      transport={scriptedTransport([
        { type: 'start' },
        400,
        ...textSteps(LONG_ANSWER, 25),
        SUGGESTIONS,
        { type: 'finish' },
      ])}
    />
  );
}

export function WidgetResultCardFailsOnce() {
  return (
    <ResultCardVariant
      hint="Scripted: the first request fails; Retry succeeds."
      transport={scriptedTransport(
        [
          { type: 'start' },
          300,
          ...textSteps('Second time lucky: go with the Pegasus.', 60),
          { type: 'finish' },
        ],
        { failFirst: true }
      )}
    />
  );
}

export function WidgetResultCardToolOnly() {
  return (
    <ResultCardVariant
      hint="Scripted: the agent only runs a tool and never writes text, so the card shows the skeleton, then disappears once complete."
      transport={scriptedTransport([
        { type: 'start' },
        1000,
        {
          type: 'tool-input-available',
          toolCallId: 'call-1',
          toolName: 'algolia_ponder',
          input: { thought: 'Comparing the top hits.' },
        },
        500,
        {
          type: 'tool-output-available',
          toolCallId: 'call-1',
          output: { ok: true },
        },
        { type: 'finish' },
      ])}
    />
  );
}
