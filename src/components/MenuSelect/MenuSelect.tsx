/** @jsx h */

import { h } from 'preact';
import cx from 'classnames';
import { find } from '../../lib/utils';
import Template from '../Template/Template';

type MenuSelectTemplates = {
  defaultOption: string;
  item: string;
};

type MenuItem = {
  /**
   * The value of the menu item.
   **/
  value: string;
  /**
   * Human-readable value of the menu item.
   **/
  label: string;
  /**
   * Number of results matched after refinement is applied.
   **/
  count: number;
  /**
   * Indicates if the refinement is applied.
   **/
  isRefined: boolean;
};

type Props = {
  cssClasses: {
    root: string;
    noRefinementRoot: string;
    select: string;
    option: string;
  };
  items: MenuItem[];
  refine: (value: MenuItem['value']) => void;
  templateProps: {
    templates: MenuSelectTemplates;
  };
};

function MenuSelect({ cssClasses, templateProps, items, refine }: Props) {
  const { value: selectedValue } = find(items, item => item.isRefined) || {
    value: '',
  };

  return (
    <div
      className={cx(cssClasses.root, {
        [cssClasses.noRefinementRoot]: items.length === 0,
      })}
    >
      <select
        className={cssClasses.select}
        value={selectedValue}
        onChange={event => {
          refine((event.target as HTMLSelectElement).value);
        }}
      >
        <Template
          {...templateProps}
          templateKey="defaultOption"
          rootTagName="option"
          rootProps={{
            value: '',
            className: cssClasses.option,
          }}
        />

        {items.map(item => (
          <Template
            {...templateProps}
            templateKey="item"
            rootTagName="option"
            rootProps={{
              value: item.value,
              className: cssClasses.option,
            }}
            key={item.value}
            data={item}
          />
        ))}
      </select>
    </div>
  );
}

export default MenuSelect;
