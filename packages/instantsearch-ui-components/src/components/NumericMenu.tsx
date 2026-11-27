/** @jsx createElement */
import { cx } from '../lib';

import type { ComponentProps, Renderer } from '../types';

export type NumericMenuItem = {
  /**
   * The encoded range used to refine.
   */
  value: string;
  /**
   * The label to display.
   */
  label: string;
  /**
   * Whether the range is selected.
   */
  isRefined: boolean;
};

export type NumericMenuClassNames = {
  /**
   * Class names to apply to the root element
   */
  root: string | string[];
  /**
   * Class names to apply to the root element when there are no refinements possible
   */
  noRefinementRoot: string | string[];
  /**
   * Class names to apply to the list element
   */
  list: string | string[];
  /**
   * Class names to apply to each item element
   */
  item: string | string[];
  /**
   * Class names to apply to each selected item element
   */
  selectedItem: string | string[];
  /**
   * Class names to apply to each label element
   */
  label: string | string[];
  /**
   * Class names to apply to each radio button
   */
  radio: string | string[];
  /**
   * Class names to apply to the text of each label
   */
  labelText: string | string[];
};

export type NumericMenuItemComponentProps = {
  item: NumericMenuItem;
  /**
   * The computed class names of the `<li>` root.
   */
  className: string;
  /**
   * The default item content (the label with its radio button), always
   * provided. Render it to keep the default markup inside a custom root.
   */
  children?: JSX.Element;
  key?: string | number;
};

export type NumericMenuProps = Omit<ComponentProps<'div'>, 'onChange'> & {
  items: NumericMenuItem[];
  /**
   * Whether the widget can refine, which drives the `noRefinement` modifier
   * of the root. Defaults to whether there are items.
   */
  canRefine?: boolean;
  /**
   * The `name` of the radio group.
   */
  attribute: string;
  /**
   * Called when an item's radio button is selected. When omitted, the radio
   * button has no change handler and the consumer handles clicks on its own
   * item root.
   */
  onRefine?: (item: NumericMenuItem) => void;
  /**
   * Overrides each item, including its `<li>` root.
   */
  itemComponent?: (props: NumericMenuItemComponentProps) => JSX.Element;
  classNames?: Partial<NumericMenuClassNames>;
};

export function createNumericMenuComponent({ createElement }: Renderer) {
  function DefaultItemComponent({
    item: _item,
    children,
    ...rootProps
  }: NumericMenuItemComponentProps) {
    return <li {...rootProps}>{children}</li>;
  }

  return function NumericMenu(userProps: NumericMenuProps) {
    const {
      items,
      canRefine = items.length > 0,
      attribute,
      onRefine,
      itemComponent: ItemComponent = DefaultItemComponent,
      classNames = {},
      ...props
    } = userProps;

    return (
      <div
        {...props}
        className={cx(
          'ais-NumericMenu',
          classNames.root,
          !canRefine &&
            cx('ais-NumericMenu--noRefinement', classNames.noRefinementRoot),
          props.className
        )}
      >
        <ul className={cx('ais-NumericMenu-list', classNames.list)}>
          {items.map((item) => (
            <ItemComponent
              key={item.label}
              item={item}
              className={cx(
                'ais-NumericMenu-item',
                classNames.item,
                item.isRefined &&
                  cx('ais-NumericMenu-item--selected', classNames.selectedItem)
              )}
            >
              <label className={cx('ais-NumericMenu-label', classNames.label)}>
                <input
                  type="radio"
                  className={cx('ais-NumericMenu-radio', classNames.radio)}
                  name={attribute}
                  value={item.value}
                  checked={item.isRefined}
                  onChange={
                    onRefine
                      ? () => {
                          onRefine(item);
                        }
                      : undefined
                  }
                />
                <span
                  className={cx(
                    'ais-NumericMenu-labelText',
                    classNames.labelText
                  )}
                >
                  {item.label}
                </span>
              </label>
            </ItemComponent>
          ))}
        </ul>
      </div>
    );
  };
}
