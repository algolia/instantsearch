/** @jsx createElement */

import { cx } from '../../lib';
import {
  getReasoningContext,
  summarizeReasoning,
  type ReasoningSummarizer,
  type ReasoningSummary,
} from '../../lib/utils/reasoning';

import { BrainIcon, ChevronDownIcon } from './icons';

import type { ComponentProps, Renderer } from '../../types';
import type { ChatMessageBase, ReasoningUIPart } from './types';

export type ChatMessageReasoningVisibility =
  | 'collapsed'
  | 'expanded'
  | 'auto'
  | 'hidden';

export type ChatMessageReasoningTranslations = {
  /** Static fallback header label, used when the summarizer returns nothing. */
  thinkingLabel: string;
  /** Aria label for the toggle button. */
  toggleLabel: string;
  /** Optional prefix for the elapsed time, e.g. "Thought for". */
  elapsedPrefix: string;
  /** Locale-friendly seconds suffix, e.g. "s". */
  elapsedSuffix: string;
};

export type ChatMessageReasoningClassNames = {
  root: string | string[];
  header: string | string[];
  icon: string | string[];
  label: string | string[];
  timer: string | string[];
  chevron: string | string[];
  body: string | string[];
  text: string | string[];
};

export type ChatMessageReasoningProps = ComponentProps<'section'> & {
  /** The full message - used by the summarizer to reach tool calls etc. */
  message: ChatMessageBase;
  /** Visibility strategy. Defaults to "auto" (open while streaming). */
  visibility?: ChatMessageReasoningVisibility;
  /** Optional override for the substitute label computation. */
  summarizer?: ReasoningSummarizer;
  /**
   * ms since the reasoning started. The component will format and display it.
   * If omitted, no timer is shown.
   */
  elapsedMs?: number;
  /**
   * Called whenever the substitute label changes. Lets the parent (e.g. the
   * loader) mirror the same label without recomputing it.
   */
  onSummaryChange?: (summary: ReasoningSummary) => void;
  classNames?: Partial<ChatMessageReasoningClassNames>;
  translations?: Partial<ChatMessageReasoningTranslations>;
};

function getReasoningParts(message: ChatMessageBase): ReasoningUIPart[] {
  return message.parts.filter(
    (p): p is ReasoningUIPart => p.type === 'reasoning'
  );
}

function formatElapsed(ms: number): string {
  if (ms < 1000) return `${Math.max(0, Math.round(ms / 100) / 10).toFixed(1)}`;
  return `${(ms / 1000).toFixed(1)}`;
}

export function createChatMessageReasoningComponent({
  createElement,
  Fragment,
}: Renderer) {
  return function ChatMessageReasoning(userProps: ChatMessageReasoningProps) {
    const {
      message,
      visibility = 'auto',
      summarizer = summarizeReasoning,
      elapsedMs,
      onSummaryChange,
      classNames = {},
      translations: userTranslations,
      ...props
    } = userProps;

    if (visibility === 'hidden') return null;

    const reasoningParts = getReasoningParts(message);
    if (reasoningParts.length === 0) return null;

    const translations: Required<ChatMessageReasoningTranslations> = {
      thinkingLabel: 'Thinking\u2026',
      toggleLabel: 'Toggle reasoning',
      elapsedPrefix: 'Thought for',
      elapsedSuffix: 's',
      ...userTranslations,
    };

    const ctx = getReasoningContext(message);
    const summary = summarizer(ctx.text, {
      message,
      lastToolCall: ctx.lastToolCall,
      streaming: ctx.streaming,
    });

    if (onSummaryChange) onSummaryChange(summary);

    // Visibility resolution.
    // - auto: open while streaming, collapse on done.
    // - expanded: always open.
    // - collapsed: always closed.
    const open =
      visibility === 'expanded' ||
      (visibility === 'auto' && ctx.streaming);

    const cssClasses: ChatMessageReasoningClassNames = {
      root: cx(
        'ais-ChatMessageReasoning',
        ctx.streaming && 'ais-ChatMessageReasoning--streaming',
        open && 'ais-ChatMessageReasoning--open',
        summary.redact && 'ais-ChatMessageReasoning--redacted',
        `ais-ChatMessageReasoning--${summary.category}`,
        classNames.root
      ),
      header: cx('ais-ChatMessageReasoning-header', classNames.header),
      icon: cx('ais-ChatMessageReasoning-icon', classNames.icon),
      label: cx('ais-ChatMessageReasoning-label', classNames.label),
      timer: cx('ais-ChatMessageReasoning-timer', classNames.timer),
      chevron: cx('ais-ChatMessageReasoning-chevron', classNames.chevron),
      body: cx('ais-ChatMessageReasoning-body', classNames.body),
      text: cx('ais-ChatMessageReasoning-text', classNames.text),
    };

    const showTimer = typeof elapsedMs === 'number' && elapsedMs > 0;
    const bodyId = `ais-reasoning-body-${message.id}`;

    return (
      <section
        {...props}
        className={cx(cssClasses.root, props.className)}
        data-state={open ? 'open' : 'closed'}
      >
        <button
          type="button"
          className={cx(cssClasses.header)}
          aria-expanded={open}
          aria-controls={bodyId}
          aria-label={translations.toggleLabel}
          // Toggling is left to the host (controlled) - but we still expose
          // the standard `details/summary` semantics so click-to-toggle works
          // through the data-state attribute and CSS sibling selectors.
        >
          <span className={cx(cssClasses.icon)} aria-hidden="true">
            <BrainIcon createElement={createElement} />
          </span>
          <span className={cx(cssClasses.label)}>
            {summary.label || translations.thinkingLabel}
          </span>
          {showTimer && (
            <span className={cx(cssClasses.timer)}>
              {translations.elapsedPrefix}{' '}
              {formatElapsed(elapsedMs as number)}
              {translations.elapsedSuffix}
            </span>
          )}
          <span className={cx(cssClasses.chevron)} aria-hidden="true">
            <ChevronDownIcon createElement={createElement} />
          </span>
        </button>

        <div
          id={bodyId}
          className={cx(cssClasses.body)}
          role="region"
          aria-live="polite"
          aria-busy={ctx.streaming}
          hidden={!open}
        >
          {!summary.redact &&
            reasoningParts.map((part, index) => (
              <p
                key={`${message.id}-reasoning-${index}`}
                className={cx(cssClasses.text)}
              >
                {part.text}
              </p>
            ))}
          {summary.redact && (
            <p className={cx(cssClasses.text)}>
              <em>(reasoning redacted for privacy)</em>
            </p>
          )}
        </div>
      </section>
    );
  };
}
