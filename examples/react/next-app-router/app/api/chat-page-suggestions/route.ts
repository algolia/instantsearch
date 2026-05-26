import { NextResponse } from 'next/server';

type RequestBody = {
  messages?: Array<{
    parts?: Array<{ type?: string; text?: string }>;
  }>;
};

type AgentInput = {
  query?: string;
  hitsSample?: Array<{ name?: string; categories?: string[] }>;
  context?: Record<string, unknown>;
  maxSuggestions?: number;
};

// Returns a mocked agent-studio response in the shape the
// `connectChatPageSuggestions` connector expects:
//   { parts: [<anything>, { text: '["prompt one", "prompt two", ...]' }] }
//
// Suggestions are loosely derived from the search query and the first hit's
// category so the demo feels reactive to refinements.
export async function POST(request: Request) {
  const url = new URL(request.url);
  const delayParam = Number(url.searchParams.get('delay'));
  // Tune via `?delay=N` (ms). Default 500ms — long enough to see the client
  // skeleton on refinement changes; short enough that SSR (with a generous
  // `ssrTimeoutMs`) still wins the race and bakes pills into server HTML.
  const delayMs = Number.isFinite(delayParam) && delayParam >= 0 ? delayParam : 500;

  const body = (await request.json().catch(() => ({}))) as RequestBody;
  const rawText = body.messages?.[0]?.parts?.[0]?.text ?? '{}';
  const input: AgentInput =
    typeof rawText === 'string'
      ? safeParse<AgentInput>(rawText) ?? {}
      : (rawText as AgentInput);

  const query = (input.query || '').trim();
  const firstHit = input.hitsSample?.[0];
  const category = firstHit?.categories?.[0];
  const max = Math.max(1, Math.min(input.maxSuggestions ?? 4, 8));

  const pool: string[] = [];
  if (query) {
    pool.push(
      `Compare the top ${query} options`,
      `What should I look for in a ${query}?`,
      `Recommend a ${query} under $500`,
      `Show me bestsellers for "${query}"`
    );
  }
  if (category) {
    pool.push(
      `What's new in ${category}?`,
      `Top-rated ${category} this month`,
      `Help me choose a ${category}`
    );
  }
  pool.push(
    'Help me find what I need',
    'What are people buying right now?',
    'Suggest something for a gift'
  );

  // Dedupe and trim to the requested length.
  const suggestions = Array.from(new Set(pool)).slice(0, max);

  await new Promise((resolve) => setTimeout(resolve, delayMs));

  return NextResponse.json({
    id: `dummy-${Date.now()}`,
    role: 'assistant',
    parts: [
      { type: 'reasoning', text: 'mocked' },
      { type: 'text', text: JSON.stringify(suggestions) },
    ],
  });
}

function safeParse<T>(text: string): T | null {
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}
