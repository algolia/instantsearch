/** @jsx createElement */
import { cx } from '../../lib';

import type { ComponentProps, Renderer } from '../../types';

export type ChatLayoutOwnProps = {
  open: boolean;
  maximized: boolean;
  headerElement: JSX.Element;
  messagesElement: JSX.Element;
  promptElement: JSX.Element;
  toggleButtonElement: JSX.Element;
  classNames?: { root?: string | string[]; container?: string | string[] };
} & Omit<ComponentProps<'div'>, 'className'>;

export function createChatOverlayLayoutComponent({ createElement }: Renderer) {
  return function ChatOverlayLayout(userProps: ChatLayoutOwnProps) {
    const {
      open,
      maximized,
      headerElement,
      messagesElement,
      promptElement,
      toggleButtonElement,
      classNames = {},
      ...rest
    } = userProps;

    return (
      <div
        {...rest}
        className={cx(
          'ais-Chat',
          'ais-ChatOverlayLayout',
          maximized && 'ais-ChatOverlayLayout--maximized',
          classNames.root
        )}
      >
        <div
          className={cx(
            'ais-Chat-container',
            open && 'ais-Chat-container--open',
            maximized && 'ais-Chat-container--maximized',
            classNames.container
          )}
        >
          {headerElement}
          {messagesElement}
          {promptElement}
        </div>

        <div className="ais-Chat-toggleButtonWrapper">
          {toggleButtonElement}
        </div>
      </div>
    );
  };
}
