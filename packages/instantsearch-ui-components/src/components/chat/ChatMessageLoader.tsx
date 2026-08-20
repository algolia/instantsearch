/** @jsx createElement */

import { cx } from '../../lib';

import { LoadingSpinnerIcon } from './icons';

import type { ChatLoaderContext, ChatMessageBase } from './types';
import type { ComponentProps, Renderer } from '../../types';

export type ChatMessageLoaderTranslations = {
  /**
   * Text to display in the loader
   */
  loaderText?: string;
};

export type ChatMessageLoaderProps = ComponentProps<'article'> & {
  /**
   * Translations for loader component texts
   */
  translations?: Partial<ChatMessageLoaderTranslations>;
  /**
   * Whether the loader renders inside a message rather than as its own row.
   * Inline loaders drop the message chrome the host already provides.
   */
  inline?: boolean;
};

/**
 * The loader reads the turn context, so it takes `ChatLoaderContext` rather than
 * the plain `ChatComponentContext` every other overridable component gets.
 */
export type ChatMessageLoaderPropsWithContext<
  TMessage extends ChatMessageBase = ChatMessageBase,
> = ChatMessageLoaderProps & {
  context: ChatLoaderContext<TMessage>;
};

export function createChatMessageLoaderComponent({
  createElement,
}: Pick<Renderer, 'createElement'>) {
  return function ChatMessageLoader<
    TMessage extends ChatMessageBase = ChatMessageBase,
  >(userProps: ChatMessageLoaderPropsWithContext<TMessage>) {
    const {
      translations: userTranslations,
      inline = false,
      className,
      // The turn context is for custom loaders, not for the DOM.
      context: _context,
      ...props
    } = userProps;
    const translations: Required<ChatMessageLoaderTranslations> = {
      loaderText: '',
      ...userTranslations,
    };

    const spinner = (
      <div className="ais-ChatMessageLoader-spinner">
        <LoadingSpinnerIcon createElement={createElement} />
      </div>
    );

    const body = (
      <div className="ais-ChatMessage-message">
        {translations.loaderText && (
          <div className="ais-ChatMessageLoader-text">
            {translations.loaderText}
          </div>
        )}
        <div className="ais-ChatMessageLoader-skeletonWrapper">
          <div className="ais-ChatMessageLoader-skeletonItem"></div>
          <div className="ais-ChatMessageLoader-skeletonItem"></div>
        </div>
      </div>
    );

    if (inline) {
      return (
        <div
          // Props are typed for the standalone `article`.
          {...(props as ComponentProps<'div'>)}
          className={cx(
            'ais-ChatMessageLoader',
            'ais-ChatMessageLoader--inline',
            className
          )}
        >
          {spinner}
          {body}
        </div>
      );
    }

    return (
      <article
        {...props}
        className={cx(
          'ais-ChatMessageLoader ais-ChatMessage ais-ChatMessage--left ais-ChatMessage--subtle',
          className
        )}
      >
        <div className="ais-ChatMessage-container">
          <div className="ais-ChatMessage-leading">{spinner}</div>

          <div className="ais-ChatMessage-content">{body}</div>
        </div>
      </article>
    );
  };
}
