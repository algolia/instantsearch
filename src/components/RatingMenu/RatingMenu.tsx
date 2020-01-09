/** @jsx h */

import { h } from 'preact';
import SharedRefinementList from '../SharedRefinementList/SharedRefinementList';
import { Template as WidgetTemplate } from '../../types';

interface RatingMenuCSSClasses {
  root: string;
  noRefinementRoot: string;
  list: string;
  item: string;
  selectedItem: string;
  disabledItem: string;
  starIcon: string;
  fullStarIcon: string;
  emptyStarIcon: string;
  label: string;
  count: string;
}

interface RatingMenuItem {
  count: number;
  isRefined: boolean;
  name: string;
  value: string;
  stars: boolean[];
}

interface RatingMenuTemplates {
  item: WidgetTemplate<
    RatingMenuItem & {
      url: string;
      labels: object;
      cssClasses: RatingMenuCSSClasses;
    }
  >;
}

interface RatingMenuProps {
  children?: React.ReactNode;
  createURL(value: string): string;
  cssClasses: RatingMenuCSSClasses;
  items: RatingMenuItem[];
  templateProps: {
    templates: RatingMenuTemplates;
  };
  toggleRefinement(value: string): void;
  suit(options: { descendantName: string }): string;
}

function RatingMenu(props: RatingMenuProps) {
  return (
    <SharedRefinementList
      createURL={props.createURL}
      cssClasses={props.cssClasses}
      items={props.items}
      templateProps={props.templateProps}
      toggleRefinement={props.toggleRefinement}
    >
      <svg xmlns="http://www.w3.org/2000/svg" style="display:none;">
        <symbol
          id={props.suit({ descendantName: 'starSymbol' })}
          viewBox="0 0 24 24"
        >
          <path d="M12 .288l2.833 8.718h9.167l-7.417 5.389 2.833 8.718-7.416-5.388-7.417 5.388 2.833-8.718-7.416-5.389h9.167z" />
        </symbol>
        <symbol
          id={props.suit({ descendantName: 'starEmptySymbol' })}
          viewBox="0 0 24 24"
        >
          <path d="M12 6.76l1.379 4.246h4.465l-3.612 2.625 1.379 4.246-3.611-2.625-3.612 2.625 1.379-4.246-3.612-2.625h4.465l1.38-4.246zm0-6.472l-2.833 8.718h-9.167l7.416 5.389-2.833 8.718 7.417-5.388 7.416 5.388-2.833-8.718 7.417-5.389h-9.167l-2.833-8.718z" />
        </symbol>
      </svg>
    </SharedRefinementList>
  );
}

export default RatingMenu;
