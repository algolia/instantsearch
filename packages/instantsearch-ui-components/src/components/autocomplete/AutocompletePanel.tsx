/** @jsx createElement */

import { cx } from '../../lib/cx';

import type { ComponentChildren, ComponentProps, Renderer } from '../../types';

export type AutocompletePanelProps = ComponentProps<'div'> & {
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
    const { children, classNames = {}, ...props } = userProps;

    return (
      <div
        {...props}
        className={cx(
          'ais-AutocompletePanel',
          classNames.root,
          props.className
        )}
      >
        <div className={cx('ais-AutocompletePanelLayout', classNames.layout)}>
          {children}
        </div>
      </div>
    );
  };
}
