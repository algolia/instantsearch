/** @jsx h */

import { h } from 'preact';
import cx from 'classnames';
import { onRefinementItemClick } from '../../lib/onRefinementItemClick';
import List from '../List/List';
import Template from '../Template/Template';
import { Template as WidgetTemplate } from '../../types';

interface HierarchicalMenuCSSClasses {
  root: string;
  noRefinementRoot: string;
  list: string;
  childList: string;
  item: string;
  selectedItem: string;
  parentItem: string;
  link: string;
  label: string;
  count: string;
  showMore: string;
  disabledShowMore: string;
}

interface HierarchicalMenuTemplates {
  item: WidgetTemplate<{
    value: string;
    label: string;
    isRefined: boolean;
    count: number;
    attribute: string;
    url: string;
    cssClasses: HierarchicalMenuCSSClasses;
  }>;
  showMoreText: WidgetTemplate<{ isShowingMore: boolean }>;
}

interface HierarchicalMenuItem {
  value: string;
  label: string;
  count: number;
  isRefined: boolean;
  data: HierarchicalMenuItem[];
}

interface HierarchicalMenuProps {
  attribute: string;
  canToggleShowMore: boolean;
  createURL(value: string): string;
  cssClasses: HierarchicalMenuCSSClasses;
  hasExhaustiveItems: boolean;
  isShowingMore: boolean;
  items: HierarchicalMenuItem[];
  showMore: boolean;
  templateProps: {
    templates: HierarchicalMenuTemplates;
  };
  toggleRefinement(value: string): void;
  toggleShowMore(): void;
}

function HierarchicalMenu(props: HierarchicalMenuProps) {
  function refine(item: HierarchicalMenuItem) {
    props.toggleRefinement(item.value);
  }

  function renderItem(item: HierarchicalMenuItem) {
    const hasChildren = item.data && item.data.length > 0;

    return (
      <li
        key={[item.value, item.isRefined, item.count].join(':')}
        className={cx(props.cssClasses.item, {
          [props.cssClasses.selectedItem]: item.isRefined,
          [props.cssClasses.parentItem]: hasChildren,
        })}
        onClick={event => onRefinementItemClick(item, event, refine)}
      >
        <Template
          {...props.templateProps}
          templateKey="item"
          data={{
            ...item,
            url: props.createURL(item.value),
            cssClasses: props.cssClasses,
            // @MAJOR: remove undocumented `attribute` template prop
            attribute: props.attribute,
          }}
        />

        {hasChildren && (
          <div className={props.cssClasses.childList}>
            <ul className={props.cssClasses.list}>
              {item.data.map(childItem => renderItem(childItem))}
            </ul>
          </div>
        )}
      </li>
    );
  }

  return (
    <List
      canRefine={props.items.length > 0}
      cssClasses={props.cssClasses}
      items={props.items}
      refine={refine}
      renderItem={renderItem}
      templateProps={props.templateProps}
    />
  );
}

export default HierarchicalMenu;
