/** @jsx createElement */
import { cx } from '../lib/cx';

import type { ComponentChildren, ComponentProps, Renderer } from '../types';

export type ButtonVariant = 'primary' | 'ghost' | 'outline';
export type ButtonSize = 'sm' | 'md';

export type ButtonProps = ComponentProps<'button'> & {
  /**
   * The button variant
   * @default 'primary'
   */
  variant?: ButtonVariant;
  /**
   * The button size
   * @default 'md'
   */
  size?: ButtonSize;
  /**
   * Whether the button contains only an icon (applies square padding)
   * @default false
   */
  iconOnly?: boolean;
  /**
   * Whether the button is disabled
   * @default false
   */
  disabled?: boolean;
  /**
   * The button class name
   */
  className?: string;
  /**
   * The button content
   */
  children?: ComponentChildren;
  /**
   * Click event handler
   */
  onClick?: (event: any) => void;
};

export function createButtonComponent({
  createElement,
}: Pick<Renderer, 'createElement'>) {
  return function Button(userProps: ButtonProps) {
    const {
      variant = 'primary',
      size = 'md',
      iconOnly = false,
      className,
      children,
      ...props
    } = userProps;

    return (
      <button
        type="button"
        className={cx(
          'ais-Button',
          `ais-Button--${variant}`,
          `ais-Button--${size}`,
          iconOnly && 'ais-Button--icon-only',
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  };
}
