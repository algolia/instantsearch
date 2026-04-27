/** @jsx createElement */

import { cx } from '../../lib';

import type { ComponentProps, Renderer } from '../../types';
import type { ChatEmptyProps } from './types';

export type ChatGreetingTranslations = {
  /**
   * Heading text for the empty screen
   */
  heading: string;
  /**
   * Subheading text for the empty screen
   */
  subheading: string;
};

export type ChatGreetingClassNames = {
  /**
   * Class names to apply to the root element
   */
  root?: string | string[];
  /**
   * Class names to apply to the heading element
   */
  heading?: string | string[];
  /**
   * Class names to apply to the subheading element
   */
  subheading?: string | string[];
  /**
   * Class names to apply to the banner element
   */
  banner?: string | string[];
};

export type ChatGreetingProps = ChatEmptyProps &
  ComponentProps<'div'> & {
    /**
     * Optional translations
     */
    translations?: Partial<ChatGreetingTranslations>;
    /**
     * Optional class names
     */
    classNames?: ChatGreetingClassNames;
    /**
     * Optional banner image URL
     */
    banner?: string;
  };

export function createChatGreetingComponent({
  createElement,
}: Pick<Renderer, 'createElement'>) {
  return function ChatGreeting(userProps: ChatGreetingProps) {
    const {
      translations: userTranslations,
      classNames = {},
      sendMessage: _sendMessage,
      status: _status,
      onClose: _onClose,
      setInput: _setInput,
      banner,
      ...props
    } = userProps;
    const translations: Required<ChatGreetingTranslations> = {
      heading: userTranslations?.heading ?? 'How can I help you today?',
      subheading:
        userTranslations?.subheading ??
        "Ask me anything about our products, and I'll do my best to assist you.",
    };

    return (
      <div
        {...props}
        className={cx('ais-ChatGreeting', classNames.root, props.className)}
      >
        {banner && (
          <img
            className={cx('ais-ChatGreeting-banner', classNames.banner)}
            src={banner}
            alt=""
          />
        )}
        <h2 className={cx('ais-ChatGreeting-heading', classNames.heading)}>
          {translations.heading}
        </h2>
        <p className={cx('ais-ChatGreeting-subheading', classNames.subheading)}>
          {translations.subheading}
        </p>
      </div>
    );
  };
}
