/** @jsx createElement */
import { RuleType, compiler } from 'markdown-to-jsx';

import { cx } from '../../lib';

import { BrainIcon, ChevronDownIcon } from './icons';

import type { ReasoningUIPart } from './types';
import type { Renderer } from '../../types';

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

export type ChatMessageReasoningPart = {
  /**
   * The received reasoning part
   */
  part: ReasoningUIPart;
  /**
   * The reasoning part's index in the full message parts array
   */
  partIndex: number;
  /**
   * Whether this reasoning part is currently being produced
   */
  isStreaming: boolean;
};

type ChatMessageReasoningProps = {
  key?: string | number;
  hidden?: boolean;
  /**
   * The received reasoning parts to render
   */
  parts: ChatMessageReasoningPart[];
  /**
   * Whether to parse the reasoning text as Markdown
   */
  parseMarkdown?: boolean;
  translations: ChatMessageReasoningTranslations;
  classNames: ChatMessageReasoningClassNames;
};

export function createChatMessageReasoningComponent({
  createElement,
}: Pick<Renderer, 'createElement'>) {
  return function ChatMessageReasoning(userProps: ChatMessageReasoningProps) {
    const {
      parts,
      hidden,
      parseMarkdown = true,
      translations,
      classNames,
    } = userProps;
    const activePart = parts.find(({ isStreaming }) => isStreaming);
    const isStreaming = Boolean(activePart);

    const renderPart = ({ part }: ChatMessageReasoningPart) =>
      parseMarkdown ? (
        compiler(part.text, {
          createElement: createElement as any,
          disableParsingRawHTML: true,
        })
      ) : (
        // Preserve newlines in plain-text reasoning.
        <p className="ais-ChatMessage-text">{part.text}</p>
      );

    const renderHint = (part: ReasoningUIPart) =>
      parseMarkdown
        ? compiler(part.text, {
            createElement: createElement as any,
            forceInline: true,
            renderRule(next, node) {
              if (
                node.type === RuleType.htmlBlock ||
                node.type === RuleType.htmlComment ||
                node.type === RuleType.htmlSelfClosing
              ) {
                return null;
              }

              return next();
            },
          })
        : part.text;

    return (
      <details
        className={cx(classNames.reasoning)}
        aria-label={translations.reasoningLabel}
        aria-busy={isStreaming}
        hidden={hidden}
      >
        <summary className={cx(classNames.reasoningHeader)}>
          <span className={cx(classNames.reasoningIcon)} aria-hidden="true">
            <BrainIcon createElement={createElement} />
          </span>
          <span className={cx(classNames.reasoningLabel)}>
            {translations.reasoningLabel}
          </span>
          {activePart && (
            <span className="ais-ChatMessageReasoning-status">
              <span
                className="ais-ChatMessageReasoning-separator"
                aria-hidden="true"
              >
                ·
              </span>
              <span className="ais-ChatMessageReasoning-hint">
                {renderHint(activePart.part)}
              </span>
            </span>
          )}
          <span className={cx(classNames.reasoningChevron)} aria-hidden="true">
            <ChevronDownIcon createElement={createElement} />
          </span>
        </summary>

        <div className={cx(classNames.reasoningBody)}>
          <ol className={cx(classNames.reasoningText)}>
            {parts.map((reasoningPart) => (
              <li
                key={reasoningPart.partIndex}
                className="ais-ChatMessageReasoning-item"
                aria-current={reasoningPart.isStreaming ? 'step' : undefined}
              >
                {renderPart(reasoningPart)}
              </li>
            ))}
          </ol>
        </div>
      </details>
    );
  };
}
