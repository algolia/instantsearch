/** @jsx createElement */
import { cx } from '../lib';

import { createSelectorComponent } from './Selector';

import type { ComponentProps, Renderer } from '../types';

export type HitsPerPageClassNames = {
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

export type HitsPerPageItem = {
  /**
   * The number of hits per page. The empty string is the blank option
   * inserted by the connector when the configured value is absent from
   * `items`; selecting it clears `hitsPerPage`.
   */
  value: number | '';
  /**
   * The label of the option to display
   */
  label: string;
  /**
   * Whether this item is the current one
   */
  isRefined?: boolean;
  /**
   * Whether this item is the default hits per page on first search
   */
  default?: boolean;
};

export type HitsPerPageProps = Omit<ComponentProps<'div'>, 'onChange'> & {
  classNames?: Partial<HitsPerPageClassNames>;
  /**
   * The items to display
   */
  items: HitsPerPageItem[];
  /**
   * The current number of hits per page. The empty string is the blank
   * option inserted by the connector when the configured value is absent
   * from `items`.
   */
  currentValue?: number | '';
  /**
   * Called with the next number of hits per page. The empty string is the
   * sentinel used by the connector for the blank option shown when the
   * configured value is absent from `items`; it clears `hitsPerPage`.
   */
  onChange?: (value: number | '') => void;
};

export function createHitsPerPageComponent({
  createElement,
  Fragment,
}: Renderer) {
  const Selector = createSelectorComponent({ createElement, Fragment });

  return function HitsPerPage(userProps: HitsPerPageProps) {
    const {
      classNames = {},
      items,
      currentValue,
      onChange,
      ...props
    } = userProps;

    return (
      <Selector
        {...props}
        classNames={{
          root: cx('ais-HitsPerPage', classNames.root),
          select: cx('ais-HitsPerPage-select', classNames.select),
          option: cx('ais-HitsPerPage-option', classNames.option),
        }}
        options={items}
        value={currentValue}
        onChange={(value) => {
          // The blank option (`value: ''`) is the connector's sentinel for
          // clearing `hitsPerPage`; converting it to a number would send `0`.
          onChange?.(value === '' ? value : Number(value));
        }}
      />
    );
  };
}
