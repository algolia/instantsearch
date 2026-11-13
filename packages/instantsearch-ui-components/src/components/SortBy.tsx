/** @jsx createElement */
import { cx } from '../lib';

import { createSelectorComponent } from './Selector';

import type { Renderer } from '../types';
import type { SelectorOption, SelectorProps } from './Selector';

export type SortByClassNames = {
  /**
   * Class names to apply to the root element
   */
  root: string | string[];
  /**
   * Class names to apply to the select element
   */
  select: string | string[];
  /**
   * Class names to apply to each option element
   */
  option: string | string[];
};

export type SortByItem = SelectorOption;

export type SortByProps = Omit<SelectorProps, 'classNames' | 'options'> & {
  classNames?: Partial<SortByClassNames>;
  /**
   * The indices (or strategies) to choose from
   */
  items: SortByItem[];
};

export function createSortByComponent({ createElement, Fragment }: Renderer) {
  const Selector = createSelectorComponent({ createElement, Fragment });

  return function SortBy(userProps: SortByProps) {
    const {
      classNames = {},
      items,
      ariaLabel = 'Sort results by',
      ...props
    } = userProps;

    return (
      <Selector
        {...props}
        classNames={{
          root: cx('ais-SortBy', classNames.root),
          select: cx('ais-SortBy-select', classNames.select),
          option: cx('ais-SortBy-option', classNames.option),
        }}
        options={items}
        ariaLabel={ariaLabel}
      />
    );
  };
}
