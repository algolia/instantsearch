/** @jsx createElement */

import { cx } from '../../lib/cx';

import type { ComponentChildren, ComponentProps, Renderer } from '../../types';

export type AutocompletePanelProps = Omit<ComponentProps<'div'>, 'children'> & {
  children?: ComponentChildren;
  classNames?: Partial<AutocompletePanelClassNames>;
};

export type AutocompletePanelClassNames = {
  /**
   * Class names to apply to the root element
   */
  root: string | string[];
  /**
   * Class names to apply to the layout element
   */
  layout: string | string[];
};

export function createAutocompletePanelComponent({ createElement }: Renderer) {
  return function AutocompletePanel(userProps: AutocompletePanelProps) {
    const { children, classNames = {}, hidden, ...props } = userProps;

    return (
      <div
        {...props}
        aria-hidden={hidden}
        className={cx(
          'ais-AutocompletePanel',
          !hidden && 'ais-AutocompletePanel--open',
          classNames.root,
          props.className
        )}
        onMouseDown={(event: React.MouseEvent<HTMLDivElement>) => {
          // Prevents the autocomplete panel from blurring the input when
          // clicking inside the panel.
          event.preventDefault();
        }}
      >
        <div className={cx('ais-AutocompletePanelLayout', classNames.layout)}>
          {children}
        </div>
      </div>
    );
  };
}
