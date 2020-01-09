/** @jsx h */

import { h } from 'preact';
import SharedRefinementList from '../SharedRefinementList/SharedRefinementList';
import { Template as WidgetTemplate } from '../../types';

interface MenuCSSClasses {
  root: string;
  noRefinementRoot: string;
  list: string;
  item: string;
  selectedItem: string;
  label: string;
  labelText: string;
  radio: string;
}

interface MenuItem {
  label: string;
  value: string;
  count: number;
  isRefined: boolean;
}

interface MenuTemplates {
  item: WidgetTemplate<
    MenuItem & {
      url: string;
      cssClasses: MenuCSSClasses;
    }
  >;
}

interface MenuProps {
  attribute: string;
  canToggleShowMore: boolean;
  createURL(value: string): string;
  cssClasses: MenuCSSClasses;
  items: MenuItem[];
  toggleRefinement(value: string): void;
  isShowingMore: boolean;
  showMore: boolean;
  templateProps: {
    templates: MenuTemplates;
  };
  toggleShowMore(): void;
}

function Menu(props: MenuProps) {
  return (
    <SharedRefinementList
      canToggleShowMore={props.canToggleShowMore}
      createURL={props.createURL}
      cssClasses={props.cssClasses}
      isShowingMore={props.isShowingMore}
      items={props.items}
      showMore={props.showMore}
      templateProps={props.templateProps}
      toggleRefinement={props.toggleRefinement}
      toggleShowMore={props.toggleShowMore}
    />
  );
}

export default Menu;
