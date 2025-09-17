/** @jsx createElement */
import { cx } from '../../lib/cx';

import { SparklesIconComponent, ChevronUpIconComponent } from './icons';

import type { ComponentProps, Renderer } from '../../types';

export type ChatToggleButtonClassNames = {
  root?: string | string[];
};

export type ChatToggleButtonProps = ComponentProps<'button'> & {
  open: boolean;
  onClick: () => void;
  toggleIconComponent?: (props: { isOpen: boolean }) => JSX.Element;
  classNames?: Partial<ChatToggleButtonClassNames>;
};

export function createChatToggleButtonComponent({ createElement }: Renderer) {
  return function ChatToggleButton({
    open,
    onClick,
    toggleIconComponent: ToggleIconComponent,
    classNames = {},
    ...props
  }: ChatToggleButtonProps) {
    const defaultIcon = open ? (
      <ChevronUpIconComponent
        createElement={createElement}
        width={28}
        height={28}
      />
    ) : (
      <SparklesIconComponent
        createElement={createElement}
        width={28}
        height={28}
      />
    );

    return (
      <button
        className={cx(
          'ais-ChatToggleButton',
          open && 'ais-ChatToggleButton--open',
          classNames.root,
          props.className
        )}
        onClick={onClick}
        type="button"
        {...props}
      >
        {ToggleIconComponent ? (
          <ToggleIconComponent isOpen={open} />
        ) : (
          defaultIcon
        )}
      </button>
    );
  };
}
