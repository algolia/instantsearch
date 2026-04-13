/** @jsx createElement */

import { cx } from '../../lib';

import type { ComponentProps, Renderer } from '../../types';
import type { ChatLayoutOwnProps, ChatStatus } from './types';

export type ChatGreetingTranslations = {
  /**
   * Heading text for the greeting
   */
  greetingHeading: string;
  /**
   * Subheading text for the greeting
   */
  greetingSubheading: string;
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

export type ChatGreetingProps = ComponentProps<'div'> & {
  /**
   * Translations for greeting component texts
   */
  translations?: Partial<ChatGreetingTranslations>;
  /**
   * Optional class names
   */
  classNames?: Partial<ChatGreetingClassNames>;
  /**
   * Function to send a message to the chat
   */
  sendMessage?: ChatLayoutOwnProps['sendMessage'];
  /**
   * Current chat status
   */
  status?: ChatStatus;
  /**
   * Callback to close the chat
   */
  onClose?: () => void;
  /**
   * Function to set the prompt input value
   */
  setInput?: (input: string) => void;
  /**
   * Banner image URL displayed above the heading
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
      greetingHeading:
        userTranslations?.greetingHeading ??
        'How can I help you today?',
      greetingSubheading:
        userTranslations?.greetingSubheading ??
        "Ask me anything about our products, and I'll do my best to assist you.",
    };

    return (
      <div
        className={cx('ais-ChatGreeting', classNames.root)}
        {...props}
      >
        {banner && (
          <img
            className={cx('ais-ChatGreeting-banner', classNames.banner)}
            src={banner}
            alt=""
          />
        )}
        <h2 className={cx('ais-ChatGreeting-heading', classNames.heading)}>
          {translations.greetingHeading}
        </h2>
        <p className={cx('ais-ChatGreeting-subheading', classNames.subheading)}>
          {translations.greetingSubheading}
        </p>
      </div>
    );
  };
}
