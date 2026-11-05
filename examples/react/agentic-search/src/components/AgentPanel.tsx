import React, { useEffect, useState } from 'react';

import { readLatestTurn } from '../agent/chat';

import { ProductCard, ProductCardSkeleton } from './ProductCard';

import type { AgenticSearch } from '../agent/useAgenticSearch';

/**
 * Models write reasoning summaries with `**Heading**` markers. Render those as
 * bold (an unclosed marker mid-stream stays as text until it closes) and keep
 * everything else as plain text.
 */
function renderBold(text: string) {
  return text
    .split(/\*\*([^*]+)\*\*/g)
    .map((segment, index) =>
      index % 2 === 1 ? <strong key={index}>{segment}</strong> : segment
    );
}

function Reasoning({
  text,
  isThinking,
  turnKey,
}: {
  text: string;
  isThinking: boolean;
  turnKey: number;
}) {
  // Open while the agent thinks, folded once it answers, unless the user
  // toggled it for this turn.
  const [userOpen, setUserOpen] = useState<boolean | null>(null);
  useEffect(() => setUserOpen(null), [turnKey]);
  const open = userOpen ?? isThinking;

  return (
    <details
      className="reasoning"
      open={open}
      onToggle={(event) => {
        const next = event.currentTarget.open;
        if (next !== open) setUserOpen(next);
      }}
    >
      <summary>
        <span className={isThinking ? 'shimmer' : undefined}>
          {isThinking ? 'Thinking…' : 'How I got there'}
        </span>
      </summary>
      <p className="reasoning-text">{text ? renderBold(text) : '…'}</p>
    </details>
  );
}

/** How many leftover candidates each "Show more" reveals. */
const MORE_PAGE_SIZE = 6;

export function AgentPanel({ agent }: { agent: AgenticSearch }) {
  const { snapshot, queries, stop, retry, reset, askForMore } = agent;
  const { status, error, messages } = snapshot;
  const turn = readLatestTurn(messages);
  const isBusy = status === 'submitted' || status === 'streaming';
  const isThinking = isBusy && turn.answer === '';
  const skeletons = isBusy ? Math.max(0, 3 - (turn.hits.length % 3)) : 0;

  // "Show more" reveals the candidates the agent found but didn't pick,
  // instantly. Once they run out, "Ask for more" is a new agent turn.
  const turnKey = messages.length;
  const [revealed, setRevealed] = useState(0);
  const [moreAnnouncement, setMoreAnnouncement] = useState('');
  useEffect(() => {
    setRevealed(0);
    setMoreAnnouncement('');
  }, [turnKey]);
  const visibleMore = turn.moreHits.slice(0, revealed);
  const remaining = turn.moreHits.length - visibleMore.length;
  const canShowMore =
    !isBusy &&
    status !== 'error' &&
    turn.hits.length + turn.moreHits.length > 0;

  const showMore = () => {
    const count = Math.min(MORE_PAGE_SIZE, remaining);
    setRevealed(visibleMore.length + count);
    setMoreAnnouncement(
      `Showing ${count} more ${count === 1 ? 'product' : 'products'}.`
    );
  };

  return (
    <section className="agent" aria-labelledby="agent-title" aria-busy={isBusy}>
      <header className="agent-header">
        <div className="agent-heading">
          <span className="badge">✦ AI mode</span>
          <h2 id="agent-title" className="sr-only">
            Agent answer
          </h2>
          <ol className="trail" aria-label="Conversation">
            {queries.map((query, index) => (
              <li
                key={index}
                className={
                  index === queries.length - 1 ? 'is-current' : undefined
                }
              >
                {query}
              </li>
            ))}
          </ol>
        </div>
        <div className="agent-actions">
          {isBusy ? (
            <button type="button" className="button" onClick={() => stop()}>
              Stop
            </button>
          ) : null}
          <button
            type="button"
            className="button"
            onClick={() => {
              reset();
              document.getElementById('search-input')?.focus();
            }}
          >
            New search
          </button>
        </div>
      </header>

      <Reasoning
        text={turn.reasoning}
        isThinking={isThinking}
        turnKey={turnKey}
      />

      {turn.answer ? (
        <p className={`answer${isBusy ? ' is-streaming' : ''}`}>
          {turn.answer}
        </p>
      ) : null}

      {status === 'error' ? (
        <div className="error" role="alert">
          <p>{error?.message || 'Something went wrong.'}</p>
          <button
            type="button"
            className="button button--primary"
            onClick={() => retry()}
          >
            Retry
          </button>
        </div>
      ) : null}

      {turn.hits.length > 0 || skeletons > 0 ? (
        <div className="grid">
          {turn.hits.map((hit, index) => (
            <ProductCard
              // Hits are not deduplicated, so the objectID alone isn't unique.
              key={`${hit.objectID}-${index}`}
              product={hit}
              style={{ animationDelay: `${(index % 2) * 60}ms` }}
            />
          ))}
          {Array.from({ length: skeletons }, (_, index) => (
            <ProductCardSkeleton key={`skeleton-${index}`} />
          ))}
        </div>
      ) : null}

      {visibleMore.length > 0 ? (
        <section className="more" aria-labelledby="more-title">
          <h3 id="more-title" className="more-title">
            Also found while searching
          </h3>
          <div className="grid">
            {visibleMore.map((hit, index) => (
              <ProductCard
                key={`${hit.objectID}-${index}`}
                product={hit}
                style={{ animationDelay: `${(index % 3) * 40}ms` }}
              />
            ))}
          </div>
        </section>
      ) : null}

      {canShowMore ? (
        <div className="more-actions">
          {remaining > 0 ? (
            <button type="button" className="button" onClick={showMore}>
              Show more
              <span className="more-count"> ({remaining})</span>
            </button>
          ) : (
            <button
              type="button"
              className="button button--ai"
              onClick={() =>
                askForMore(
                  [...turn.hits, ...visibleMore].map((hit) => hit.objectID)
                )
              }
            >
              ✦ Ask the agent for more
            </button>
          )}
        </div>
      ) : null}

      <div className="sr-only" role="status" aria-live="polite">
        {moreAnnouncement}
      </div>
    </section>
  );
}

/** One-line summary of the agent turn for the live region. */
export function describeAgentTurn(agent: AgenticSearch): string {
  const { status, messages } = agent.snapshot;
  if (status === 'submitted' || status === 'streaming') {
    return 'The agent is working on your request.';
  }
  if (status === 'error') return '';
  const { hits } = readLatestTurn(messages);
  return hits.length > 0
    ? `The agent answered and picked ${hits.length} ${
        hits.length === 1 ? 'product' : 'products'
      }.`
    : 'The agent answered without products.';
}
