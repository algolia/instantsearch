/**
 * Reasoning categorization utilities.
 *
 * Modern reasoning models (GPT-5/o-series, Claude with extended/adaptive
 * thinking, Gemini 2.5+, DeepSeek-R1-class) emit a stream of internal
 * chain-of-thought (or, where supported, a server-side summary).
 *
 * Showing that stream verbatim is overwhelming and sometimes unsafe.
 * We project it onto a single short "substitute label" that is friendly,
 * stable, and refreshed at most every ~600ms by the consumer.
 *
 * The strategy is intentionally tiny: zero dependencies, synchronous,
 * predictable. Apps can replace it wholesale by passing a custom
 * {@link ReasoningSummarizer}.
 */

import { startsWith } from './startsWith';

import type { ChatMessageBase } from '../../components/chat/types';

export type ReasoningCategory =
  | 'thinking'
  | 'searching'
  | 'filtering'
  | 'ranking'
  | 'pricing'
  | 'attributes'
  | 'summarising'
  | 'images'
  | 'planning'
  | 'tool';

export type ReasoningSummary = {
  /** Short user-facing label, e.g. "Searching the catalogue". */
  label: string;
  /** Coarse category for telemetry/styling. */
  category: ReasoningCategory;
  /**
   * If true, the host should not display the raw reasoning body
   * (used when the categorizer detects PII / prompt fragments).
   */
  redact?: boolean;
};

export type ReasoningSummarizerContext = {
  /** The full message currently being rendered. */
  message: ChatMessageBase;
  /** The most recent assistant tool call, if any. */
  lastToolCall?: ChatMessageBase['parts'][number] & { type: `tool-${string}` };
  /** Truthy when the latest reasoning part is still streaming. */
  streaming?: boolean;
};

export type ReasoningSummarizer = (
  reasoningText: string,
  ctx: ReasoningSummarizerContext
) => ReasoningSummary;

const PII_PATTERN =
  /\b(?:api[_-]?key|secret|bearer\s+[a-z0-9._-]+|sk-[a-z0-9]{20,}|ssn|passport|credit\s*card)\b/i;

const KEYWORD_RULES: Array<{
  test: RegExp;
  category: ReasoningCategory;
  label: string;
}> = [
  // ordering matters: more specific first
  { test: /\b(price|budget|cheap|expensive|cost|usd|eur)\b/i,                  category: 'pricing',     label: 'Looking at price ranges' },
  { test: /\b(image|photo|picture|visual|thumbnail)\b/i,                       category: 'images',      label: 'Looking at product images' },
  { test: /\b(filter|narrow|refin|facet|category)\b/i,                         category: 'filtering',   label: 'Narrowing down filters' },
  { test: /\b(rank|sort|order|rerank|relevan(t|ce))\b/i,                       category: 'ranking',     label: 'Comparing top matches' },
  { test: /\b(size|colou?r|brand|material|fabric|fit)\b/i,                     category: 'attributes',  label: 'Reading product attributes' },
  { test: /\b(summari[sz]e|conclude|recommend|suggest|propose)\b/i,            category: 'summarising', label: 'Summarising the results' },
  { test: /\b(search|look(?:ing)?\s+up|find(?:ing)?|query|catalog(?:ue)?)\b/i, category: 'searching',   label: 'Searching the catalogue' },
  { test: /\b(plan|strategy|approach|let me think|i should|i'll|i will)\b/i,   category: 'planning',    label: 'Planning the next step' },
];

/**
 * Heuristic categorizer. Runs over the **last 2 KB** of the buffer only,
 * so it stays cheap as the reasoning stream grows.
 */
export function categorizeReasoning(reasoningText: string): ReasoningSummary {
  const tail = reasoningText.length > 2048
    ? reasoningText.slice(-2048)
    : reasoningText;

  if (!tail.trim()) {
    return { label: 'Thinking\u2026', category: 'thinking' };
  }

  const redact = PII_PATTERN.test(tail);

  for (const rule of KEYWORD_RULES) {
    if (rule.test.test(tail)) {
      return { label: rule.label, category: rule.category, redact };
    }
  }

  return { label: 'Thinking\u2026', category: 'thinking', redact };
}

/**
 * Tier 2 categorizer: derive a label from the most recent tool call.
 * Returns null when no useful inference can be made.
 */
export function categorizeFromToolCall(
  part: { type: `tool-${string}`; input?: unknown }
): ReasoningSummary | null {
  const toolName = part.type.slice('tool-'.length);

  if (startsWith(toolName, 'algolia_search_index')) {
    const indexName = readStringProp(part.input, 'indexName');
    return {
      category: 'tool',
      label: indexName
        ? `Searching the ${truncate(indexName, 28)} index`
        : 'Searching the catalogue',
    };
  }

  if (startsWith(toolName, 'algolia_recommend')) {
    return { category: 'tool', label: 'Looking at related products' };
  }

  if (toolName === 'apply_filters' || startsWith(toolName, 'apply_filters')) {
    return { category: 'filtering', label: 'Narrowing down filters' };
  }

  if (startsWith(toolName, 'compare')) {
    return { category: 'ranking', label: 'Comparing top matches' };
  }

  return { category: 'tool', label: `Running ${humanize(toolName)}` };
}

/**
 * Top-level summarizer that walks the three tiers described in the RFC:
 *
 *  1. Server-side summary already present in the reasoning stream.
 *     (We accept any reasoning text shorter than `serverSummaryThreshold`
 *      as evidence that the server pre-summarized.)
 *  2. Tool-call inference, if a tool is currently in flight.
 *  3. Heuristic regex categorizer over the last ~2 KB of the buffer.
 */
export function summarizeReasoning(
  reasoningText: string,
  ctx: ReasoningSummarizerContext,
  options: { serverSummaryThreshold?: number } = {}
): ReasoningSummary {
  const threshold = options.serverSummaryThreshold ?? 280;

  // Tier 1: short server-side summary - use the first sentence verbatim.
  const trimmed = reasoningText.trim();
  if (trimmed && trimmed.length <= threshold && !ctx.streaming) {
    const firstSentence = trimmed.split(/(?<=[.!?])\s+/, 1)[0];
    return {
      label: truncate(firstSentence, 64),
      category: inferCategoryFromText(firstSentence),
    };
  }

  // Tier 2: tool-call inference.
  if (ctx.lastToolCall) {
    const fromTool = categorizeFromToolCall(ctx.lastToolCall);
    if (fromTool) return fromTool;
  }

  // Tier 3: heuristic.
  return categorizeReasoning(reasoningText);
}

function inferCategoryFromText(text: string): ReasoningCategory {
  return categorizeReasoning(text).category;
}

function readStringProp(input: unknown, key: string): string | undefined {
  if (input && typeof input === 'object' && !Array.isArray(input)) {
    const value = (input as Record<string, unknown>)[key];
    return typeof value === 'string' ? value : undefined;
  }
  return undefined;
}

function truncate(value: string, max: number): string {
  return value.length > max ? `${value.slice(0, max - 1)}\u2026` : value;
}

function humanize(toolName: string): string {
  return toolName
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Pull the current reasoning text and most recent tool call from a message.
 * Convenience for callers that only have the {@link ChatMessageBase}.
 */
export function getReasoningContext(
  message: ChatMessageBase
): { text: string; lastToolCall?: ReasoningSummarizerContext['lastToolCall']; streaming: boolean } {
  let text = '';
  let streaming = false;
  let lastToolCall: ReasoningSummarizerContext['lastToolCall'] | undefined;

  for (const part of message.parts) {
    if (part.type === 'reasoning') {
      text += part.text;
      if (part.state === 'streaming') {
        streaming = true;
      }
    } else if (startsWith(part.type, 'tool-')) {
      lastToolCall = part as ReasoningSummarizerContext['lastToolCall'];
    }
  }

  return { text, lastToolCall, streaming };
}
