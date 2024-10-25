/** @jsx h */

import { cx } from 'instantsearch-ui-components';
import { h } from 'preact';

import Template from '../Template/Template';

import type { MenuRenderState } from '../../connectors';
import type { ComponentCSSClasses } from '../../types';
import type {
  MenuSelectCSSClasses,
  MenuSelectTemplates,
} from '../../widgets/menu-select/menu-select';

export type MenuSelectComponentCSSClasses =
  ComponentCSSClasses<MenuSelectCSSClasses>;

export type MenuSelectComponentTemplates = Required<MenuSelectTemplates>;

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
  cssClasses: MenuSelectComponentCSSClasses;
  items: MenuItem[];
  refine: MenuRenderState['refine'];
  templateProps: {
    templates: MenuSelectComponentTemplates;
  };
};

function MenuSelect({ cssClasses, templateProps, items, refine }: Props) {
  const { value: selectedValue } = items.find((item) => item.isRefined) || {
    value: '',
  };

  return (
    <div
      className={cx(
        cssClasses.root,
        items.length === 0 && cssClasses.noRefinementRoot
      )}
    >
      <select
        className={cssClasses.select}
        value={selectedValue}
        onChange={(event) => {
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

        {items.map((item) => (
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
