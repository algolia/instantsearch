/** @jsx createElement */
/** @jsxFrag Fragment */
import { isPartText, isPartTool } from 'instantsearch-core';

import { cx } from '../../lib';
import { findLastProgressPart, isPartTextEmpty } from '../../lib/chat';
import { createButtonComponent } from '../Button';

import { createChatMessageComponent } from './ChatMessage';
import { createChatMessageErrorComponent } from './ChatMessageError';
import { createChatMessageLoaderComponent } from './ChatMessageLoader';
import { createChatPromptSuggestionsComponent } from './ChatPromptSuggestions';
import {
  ChevronDownIcon,
  ChevronUpIcon,
  MaximizeIcon,
  MinimizeIcon,
  SparklesIcon,
} from './icons';

import type { ComponentProps, Hooks, Renderer } from '../../types';
import type {
  ChatComponentContext,
  ChatMessageBase,
  ChatStatus,
} from 'instantsearch-core';

export type ResultCardStatus =
  | 'hidden'
  | 'loading'
  | 'streaming'
  | 'complete'
  | 'failed';

export type ResultCardClassNames = {
  root: string | string[];
  header: string | string[];
  headerTitle: string | string[];
  minimizeButton: string | string[];
  body: string | string[];
  loader: string | string[];
  message: string | string[];
  suggestions: string | string[];
  expandButton: string | string[];
  continueButton: string | string[];
};

export type ResultCardTranslations = {
  /**
   * The title displayed in the header.
   */
  headerTitle: string;
  /**
   * Accessible label for the button that collapses the card to its header.
   */
  minimizeLabel: string;
  /**
   * Accessible label for the button that restores a minimized card.
   */
  maximizeLabel: string;
  /**
   * The text of the button that shows a clipped answer in full.
   */
  expandText: string;
  /**
   * The text of the button that clips an expanded answer again.
   */
  collapseText: string;
  /**
   * The text of the button that hands the conversation to the chat.
   */
  continueInChatText: string;
  /**
   * The text of the retry button shown when the generation failed.
   */
  retryText: string;
};

export type ResultCardOwnProps<
  TMessage extends ChatMessageBase = ChatMessageBase,
> = ComponentProps<'section'> & {
  status: ResultCardStatus;
  /**
   * The card's conversation: the user turn, then the assistant answer.
   */
  messages: TMessage[];
  /**
   * The error of the latest failed generation.
   */
  error?: Error;
  /**
   * Follow-up suggestions sent by the agent with the answer. Only shown when
   * the conversation can continue in the chat.
   */
  suggestions?: string[];
  onRetry: () => void;
  /**
   * Whether the card is collapsed to its header. The answer keeps generating
   * meanwhile.
   */
  minimized: boolean;
  onToggleMinimize: () => void;
  /**
   * Whether a `chat` widget with the same agent is available to hand the
   * conversation to.
   */
  canContinueInChat: boolean;
  /**
   * Hands the conversation to the chat; `message` is the follow-up to send.
   */
  onContinueInChat: (message?: string) => void;
  /**
   * Whether a long answer shows in full rather than clipped.
   */
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
  translations?: Partial<ResultCardTranslations>;
  classNames?: Partial<ResultCardClassNames>;
};

// Keeps the card compact: the chat shows the full list after the handoff.
const MAX_SUGGESTIONS = 2;

// The card renders no tool layouts, the only readers of the index UI state
// and of `onClose`.
const noop = () => {};

const CHAT_STATUS: Record<ResultCardStatus, ChatStatus> = {
  hidden: 'ready',
  loading: 'submitted',
  streaming: 'streaming',
  complete: 'ready',
  failed: 'error',
};

let lastBodyId = 0;

export function createResultCardComponent({
  createElement,
  Fragment,
  useState,
  useEffect,
}: Renderer & Pick<Hooks, 'useState' | 'useEffect'>) {
  const Button = createButtonComponent({ createElement });
  const ChatMessage = createChatMessageComponent({ createElement, Fragment });
  const ChatMessageError = createChatMessageErrorComponent({ createElement });
  const ChatMessageLoader = createChatMessageLoaderComponent({ createElement });
  const ChatPromptSuggestions = createChatPromptSuggestionsComponent({
    createElement,
    Fragment,
  });

  return function ResultCard<
    TMessage extends ChatMessageBase = ChatMessageBase,
  >(userProps: ResultCardOwnProps<TMessage>) {
    const {
      status,
      messages,
      error,
      suggestions,
      onRetry,
      minimized,
      onToggleMinimize,
      canContinueInChat,
      onContinueInChat,
      expanded,
      onExpandedChange,
      translations: userTranslations,
      classNames = {},
      ...props
    } = userProps;

    const translations: ResultCardTranslations = {
      headerTitle: 'AI Overview',
      minimizeLabel: 'Minimize',
      maximizeLabel: 'Maximize',
      expandText: 'Show more',
      collapseText: 'Show less',
      continueInChatText: 'Continue in chat',
      retryText: 'Retry',
      ...userTranslations,
    };

    const isBusy = status === 'loading' || status === 'streaming';
    const isComplete = status === 'complete';
    const assistantMessages = messages.filter(
      (message) => message.role === 'assistant'
    );
    // Reasoning is hidden and the card has no tool renderers, so only text
    // shows: until the first text arrives a loader stands in for the answer.
    const hasVisibleAnswer = assistantMessages.some((message) =>
      message.parts.some((part) => isPartText(part) && !isPartTextEmpty(part))
    );
    const lastAssistantMessage =
      assistantMessages[assistantMessages.length - 1];
    const lastProgressPart = findLastProgressPart(lastAssistantMessage?.parts);
    const isToolRunning =
      isBusy && lastProgressPart !== undefined && isPartTool(lastProgressPart);

    // The body is measured when its content or the viewport changes: the toggle
    // only shows when there is something to reveal, and the expanded height is
    // set in pixels so `max-height` can transition. Toggling `expanded` does
    // not re-measure: an unclipped body never overflows, and right after a
    // collapse the height is still mid-transition, so the end of that
    // transition measures again.
    const [body, setBody] = useState<HTMLDivElement | null>(null);
    const [overflowing, setOverflowing] = useState(false);
    const [contentHeight, setContentHeight] = useState<number | undefined>(
      undefined
    );
    const latest = useState<{
      expanded: boolean;
      onExpandedChange: (expanded: boolean) => void;
      hasVisibleAnswer: boolean;
      autoExpanded: boolean;
      autoExpandTimer?: ReturnType<typeof setTimeout>;
      measure?: () => void;
      bodyId: string;
    }>({
      expanded,
      onExpandedChange,
      hasVisibleAnswer,
      autoExpanded: false,
      bodyId: '',
    })[0];
    latest.expanded = expanded;
    latest.onExpandedChange = onExpandedChange;
    latest.hasVisibleAnswer = hasVisibleAnswer;
    if (!hasVisibleAnswer) latest.autoExpanded = false;
    if (!latest.bodyId) latest.bodyId = `ais-ResultCard-body-${lastBodyId++}`;
    const titleId = `${latest.bodyId}-title`;
    useEffect(() => {
      if (!body) return undefined;
      const measure = () => {
        setContentHeight(body.scrollHeight);
        if (latest.expanded) {
          // Already open, e.g. kept open by a retry: nothing left to open on
          // its own, so "Show less" is not undone.
          if (latest.hasVisibleAnswer) latest.autoExpanded = true;
          return;
        }
        const isOverflowing = body.scrollHeight > body.clientHeight;
        setOverflowing(isOverflowing);
        // Both sizes look the same until the answer outgrows the clipped
        // height, so that is when it grows, once per answer: after "Show less"
        // it stays clipped.
        if (isOverflowing && latest.hasVisibleAnswer && !latest.autoExpanded) {
          latest.autoExpanded = true;
          // Deferred: the host re-renders the card in response, and with
          // Preact a re-render from inside this effect duplicates the card.
          latest.autoExpandTimer = setTimeout(() => {
            latest.autoExpandTimer = undefined;
            if (latest.hasVisibleAnswer) latest.onExpandedChange(true);
          }, 0);
        }
      };
      latest.measure = measure;
      measure();
      window.addEventListener('resize', measure);
      return () => {
        latest.measure = undefined;
        window.removeEventListener('resize', measure);
        // A cancelled expansion is scheduled again by the next measurement.
        if (latest.autoExpandTimer !== undefined) {
          clearTimeout(latest.autoExpandTimer);
          latest.autoExpandTimer = undefined;
          latest.autoExpanded = false;
        }
      };
    }, [body, latest, messages, status]);

    // Set after mount: screen readers skip a live region inserted with its
    // text, so the card's first answer would start silently.
    const statusText = isBusy
      ? 'Generating answer'
      : isComplete
        ? 'Answer ready'
        : '';
    const [announcement, setAnnouncement] = useState('');
    useEffect(() => {
      setAnnouncement(statusText);
    }, [statusText]);

    if (
      status === 'hidden' ||
      // A finished answer with no text (tool output only) has nothing to show;
      // the skeleton is reserved for busy states.
      (isComplete && !hasVisibleAnswer)
    ) {
      return null;
    }
    const showSuggestions =
      !minimized &&
      isComplete &&
      canContinueInChat &&
      Boolean(suggestions?.length);
    // The error is never clipped: there is no toggle to reveal a hidden Retry.
    const unclipped = expanded || status === 'failed';
    const clipped = overflowing && !unclipped;
    const showExpandToggle =
      !minimized &&
      hasVisibleAnswer &&
      status !== 'failed' &&
      (overflowing || expanded);

    const context: ChatComponentContext<TMessage> = {
      messages,
      status: CHAT_STATUS[status],
      error,
      isClearing: false,
      open: true,
      maximized: false,
      tools: {},
      regenerate: () => {
        onRetry();
        return Promise.resolve();
      },
      stop: () => Promise.resolve(),
      onReload: onRetry,
      onClose: noop,
    };
    const minimizeToggleLabel = minimized
      ? translations.maximizeLabel
      : translations.minimizeLabel;
    return (
      <section
        {...props}
        className={cx('ais-ResultCard', classNames.root, props.className)}
        data-status={status}
      >
        {/* Announces progress once instead of every streamed chunk. Outside
            the busy body, which would defer the announcement. */}
        <div
          className="ais-ResultCard-status"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {announcement}
        </div>
        <div className={cx('ais-ResultCard-header', classNames.header)}>
          <span
            id={expanded ? titleId : undefined}
            className={cx('ais-ResultCard-headerTitle', classNames.headerTitle)}
          >
            <SparklesIcon createElement={createElement} />
            {translations.headerTitle}
          </span>
          {/* In the header so it stays reachable when the answer is clipped. */}
          {isComplete && canContinueInChat && !minimized && (
            <Button
              variant="outline"
              size="sm"
              className={cx(
                'ais-ResultCard-continueButton',
                classNames.continueButton
              )}
              onClick={() => onContinueInChat()}
            >
              {translations.continueInChatText}
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            iconOnly
            className={cx(
              'ais-ResultCard-minimizeButton',
              classNames.minimizeButton
            )}
            title={minimizeToggleLabel}
            aria-label={minimizeToggleLabel}
            aria-expanded={minimized ? 'false' : 'true'}
            onClick={onToggleMinimize}
          >
            {minimized ? (
              <MaximizeIcon createElement={createElement} />
            ) : (
              <MinimizeIcon createElement={createElement} />
            )}
          </Button>
        </div>

        {/* Unmounted rather than hidden: it is measured again on restore. */}
        {!minimized && (
          <div
            ref={setBody}
            // Ids only once the toggle shows, which never happens in a server
            // render, so hydration keeps them.
            id={showExpandToggle ? latest.bodyId : undefined}
            className={cx(
              'ais-ResultCard-body',
              unclipped && 'ais-ResultCard-body--expanded',
              clipped && 'ais-ResultCard-body--clipped',
              classNames.body
            )}
            aria-busy={isBusy ? 'true' : undefined}
            onTransitionEnd={(event) => {
              if (event.target === event.currentTarget) latest.measure?.();
            }}
            // The expanded answer scrolls past its cap: focusable so keyboard
            // users can scroll it without a link inside.
            {...(expanded
              ? { tabIndex: 0, role: 'region', 'aria-labelledby': titleId }
              : {})}
            style={
              expanded && contentHeight !== undefined
                ? {
                    maxHeight: `min(${contentHeight}px, var(--ais-result-card-expanded-max-height))`,
                  }
                : undefined
            }
            // Clipping is visual only: links below the fold stay in the tab
            // order, so reaching one reveals it. Capture phase because `focus`
            // does not bubble in Preact.
            onFocusCapture={() => {
              if (clipped) onExpandedChange(true);
            }}
          >
            {status === 'failed' ? (
              <ChatMessageError
                // The status region goes quiet on failure, so the error
                // announces itself.
                role="alert"
                context={context}
                errorMessage={error?.message}
                onReload={onRetry}
                translations={{ retryText: translations.retryText }}
              />
            ) : !hasVisibleAnswer && isToolRunning ? (
              // Text-free: the card has no tool layouts to name the step.
              <ChatMessageLoader
                inline
                context={{
                  ...context,
                  phase: 'tool',
                  message: lastAssistantMessage,
                }}
              />
            ) : !hasVisibleAnswer ? (
              // Skeleton only: the header already marks the card as AI, and
              // three lines match the clipped body height (see the theme).
              <div className={cx('ais-ResultCard-loader', classNames.loader)}>
                <div className="ais-ResultCard-loaderLine" />
                <div className="ais-ResultCard-loaderLine" />
                <div className="ais-ResultCard-loaderLine" />
              </div>
            ) : (
              assistantMessages.map((message) => (
                <ChatMessage
                  key={message.id}
                  context={context}
                  message={message}
                  messages={messages}
                  side="left"
                  variant="subtle"
                  showReasoning={false}
                  indexUiState={{}}
                  setIndexUiState={noop}
                  classNames={{
                    root: cx('ais-ResultCard-message', classNames.message),
                  }}
                />
              ))
            )}
          </div>
        )}

        {/* Outside the clipped body so a row of chips is never cut through:
            a clipped card hides them until "Show more". */}
        {showSuggestions && !clipped && (
          <ChatPromptSuggestions
            suggestions={suggestions?.slice(0, MAX_SUGGESTIONS)}
            onSuggestionClick={onContinueInChat}
            classNames={{
              root: cx('ais-ResultCard-suggestions', classNames.suggestions),
            }}
          />
        )}

        {showExpandToggle && (
          <Button
            variant="ghost"
            size="sm"
            className={cx(
              'ais-ResultCard-expandButton',
              classNames.expandButton
            )}
            aria-expanded={expanded ? 'true' : 'false'}
            aria-controls={latest.bodyId}
            onClick={() => {
              // The clipped answer starts from the top, wherever it was
              // scrolled while expanded.
              if (expanded && body) body.scrollTop = 0;
              onExpandedChange(!expanded);
            }}
          >
            {expanded ? translations.collapseText : translations.expandText}
            {expanded ? (
              <ChevronUpIcon createElement={createElement} />
            ) : (
              <ChevronDownIcon createElement={createElement} />
            )}
          </Button>
        )}
      </section>
    );
  };
}
