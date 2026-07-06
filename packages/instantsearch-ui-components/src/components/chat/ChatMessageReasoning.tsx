/** @jsx createElement */

import { cx } from '../../lib';

import { BrainIcon, ChevronDownIcon } from './icons';

import type { ComponentProps, Renderer } from '../../types';
import type { ChatMessageBase, ReasoningUIPart } from './types';

export type ChatMessageReasoningVisibility =
  | 'collapsed'
  | 'expanded'
  | 'auto'
  | 'hidden';

export type ChatMessageReasoningTranslations = {
  /**
   * Header label for the reasoning panel. Defaults to "Reasoning" to match
   * the Agent Studio dashboard.
   */
  title: string;
  /** Accessible label for the disclosure toggle. */
  toggleLabel: string;
};

export type ChatMessageReasoningClassNames = {
  root: string | string[];
  header: string | string[];
  icon: string | string[];
  label: string | string[];
  chevron: string | string[];
  body: string | string[];
  text: string | string[];
};

export type ChatMessageReasoningProps = ComponentProps<'details'> & {
  /** The message whose `reasoning` parts should be rendered. */
  message: ChatMessageBase;
  /**
   * Visibility strategy.
   * - `collapsed` (default): closed, user can expand — mirrors the dashboard.
   * - `expanded`: always open.
   * - `auto`: open while streaming, collapsible afterwards.
   * - `hidden`: render nothing even if reasoning parts exist.
   */
  visibility?: ChatMessageReasoningVisibility;
  classNames?: Partial<ChatMessageReasoningClassNames>;
  translations?: Partial<ChatMessageReasoningTranslations>;
};

function getReasoningParts(message: ChatMessageBase): ReasoningUIPart[] {
  return message.parts.filter(
    (p): p is ReasoningUIPart => p.type === 'reasoning'
  );
}

export function createChatMessageReasoningComponent({
  createElement,
}: Renderer) {
  return function ChatMessageReasoning(userProps: ChatMessageReasoningProps) {
    const {
      message,
      visibility = 'collapsed',
      classNames = {},
      translations: userTranslations,
      ...props
    } = userProps;

    if (visibility === 'hidden') return null;

    const reasoningParts = getReasoningParts(message);
    if (reasoningParts.length === 0) return null;

    const translations: Required<ChatMessageReasoningTranslations> = {
      title: 'Reasoning',
      toggleLabel: 'Toggle reasoning',
      ...userTranslations,
    };

    const streaming = reasoningParts.some((part) => part.state === 'streaming');

    // Native `<details>` handles the open/closed state (and the `[open]`
    // attribute the CSS keys off) with zero JS. We only force `open` for the
    // `expanded` strategy and while streaming under `auto`; otherwise the
    // element is uncontrolled so the user can freely toggle it.
    const forceOpen =
      visibility === 'expanded' || (visibility === 'auto' && streaming);

    const cssClasses: ChatMessageReasoningClassNames = {
      root: cx(
        'ais-ChatMessageReasoning',
        streaming && 'ais-ChatMessageReasoning--streaming',
        classNames.root
      ),
      header: cx('ais-ChatMessageReasoning-header', classNames.header),
      icon: cx('ais-ChatMessageReasoning-icon', classNames.icon),
      label: cx('ais-ChatMessageReasoning-label', classNames.label),
      chevron: cx('ais-ChatMessageReasoning-chevron', classNames.chevron),
      body: cx('ais-ChatMessageReasoning-body', classNames.body),
      text: cx('ais-ChatMessageReasoning-text', classNames.text),
    };

    return (
      <details
        {...props}
        className={cx(cssClasses.root, props.className)}
        open={forceOpen || undefined}
      >
        <summary
          className={cx(cssClasses.header)}
          aria-label={translations.toggleLabel}
        >
          <span className={cx(cssClasses.icon)} aria-hidden="true">
            <BrainIcon createElement={createElement} />
          </span>
          <span className={cx(cssClasses.label)}>{translations.title}</span>
          <span className={cx(cssClasses.chevron)} aria-hidden="true">
            <ChevronDownIcon createElement={createElement} />
          </span>
        </summary>

        <div className={cx(cssClasses.body)} aria-busy={streaming}>
          {reasoningParts.map((part, index) => (
            <p
              key={`${message.id}-reasoning-${index}`}
              className={cx(cssClasses.text)}
            >
              {part.text}
            </p>
          ))}
        </div>
      </details>
    );
  };
}
