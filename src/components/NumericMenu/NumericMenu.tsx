/** @jsx h */

import { h } from 'preact';
import SharedRefinementList from '../SharedRefinementList/SharedRefinementList';
import { Template as WidgetTemplate } from '../../types';

interface NumericMenuCSSClasses {
  root: string;
  noRefinementRoot: string;
  list: string;
  item: string;
  selectedItem: string;
  label: string;
  labelText: string;
  radio: string;
}

interface NumericMenuItem {
  label: string;
  value: string;
  isRefined: boolean;
}

interface NumericMenuTemplates {
  item: WidgetTemplate<
    NumericMenuItem & {
      attribute: string;
      url: string;
      labels: object;
      cssClasses: NumericMenuCSSClasses;
    }
  >;
}

interface NumericMenuProps {
  attribute: string;
  createURL(value: string): string;
  cssClasses: NumericMenuCSSClasses;
  items: NumericMenuItem[];
  templateProps: {
    templates: NumericMenuTemplates;
  };
  toggleRefinement(value: string): void;
}

function NumericMenu(props: NumericMenuProps) {
  return (
    <SharedRefinementList
      attribute={props.attribute}
      createURL={props.createURL}
      cssClasses={props.cssClasses}
      items={props.items}
      templateProps={props.templateProps}
      toggleRefinement={props.toggleRefinement}
    />
  );
}

export default NumericMenu;
