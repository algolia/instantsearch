/** @jsx createElement */
import { compiler } from 'markdown-to-jsx';

import { cx } from '../../lib';

import { BrainIcon, ChevronDownIcon } from './icons';

import type { Renderer } from '../../types';
import type { ReasoningUIPart } from './types';

export type ChatMessageReasoningTranslations = {
  /**
   * The label for a reasoning disclosure
   */
  reasoningLabel: string;
};

export type ChatMessageReasoningClassNames = {
  /**
   * Class names to apply to a reasoning disclosure
   */
  reasoning: string | string[];
  /**
   * Class names to apply to a reasoning disclosure header
   */
  reasoningHeader: string | string[];
  /**
   * Class names to apply to a reasoning disclosure icon
   */
  reasoningIcon: string | string[];
  /**
   * Class names to apply to a reasoning disclosure label
   */
  reasoningLabel: string | string[];
  /**
   * Class names to apply to a reasoning disclosure chevron
   */
  reasoningChevron: string | string[];
  /**
   * Class names to apply to a reasoning disclosure body
   */
  reasoningBody: string | string[];
  /**
   * Class names to apply to reasoning text
   */
  reasoningText: string | string[];
};

type ChatMessageReasoningProps = {
  key?: string | number;
  part: ReasoningUIPart;
  translations: ChatMessageReasoningTranslations;
  classNames: ChatMessageReasoningClassNames;
};

export function createChatMessageReasoningComponent({
  createElement,
}: Pick<Renderer, 'createElement'>) {
  return function ChatMessageReasoning(userProps: ChatMessageReasoningProps) {
    const { part, translations, classNames } = userProps;
    const isStreaming = part.state === 'streaming';
    const markdown = compiler(part.text, {
      createElement: createElement as any,
      disableParsingRawHTML: true,
    });

    return (
      <details
        className={cx(classNames.reasoning)}
        aria-label={translations.reasoningLabel}
        aria-busy={isStreaming}
      >
        <summary className={cx(classNames.reasoningHeader)}>
          <span className={cx(classNames.reasoningIcon)} aria-hidden="true">
            <BrainIcon createElement={createElement} />
          </span>
          <span className={cx(classNames.reasoningLabel)}>
            {translations.reasoningLabel}
          </span>
          <span className={cx(classNames.reasoningChevron)} aria-hidden="true">
            <ChevronDownIcon createElement={createElement} />
          </span>
        </summary>

        <div className={cx(classNames.reasoningBody)}>
          <div className={cx(classNames.reasoningText)}>{markdown}</div>
        </div>
      </details>
    );
  };
}
