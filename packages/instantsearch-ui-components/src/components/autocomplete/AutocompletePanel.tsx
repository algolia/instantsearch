/** @jsx createElement */

import { cx } from '../../lib/cx';

import type { ComponentChildren, Renderer } from '../../types';

export type AutocompletePanelProps = {
  isOpen: boolean;
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
    const { children, isOpen, classNames = {} } = userProps;

    return (
      <div
        className={cx('ais-AutocompletePanel', classNames.root)}
        hidden={!isOpen}
      >
        <div className={cx('ais-AutocompletePanelLayout', classNames.layout)}>
          {children}
        </div>
      </div>
    );
  };
}
