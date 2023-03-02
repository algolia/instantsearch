/** @jsx h */

import { h } from 'preact';

import Template from '../Template/Template';

import type { JSX } from 'preact';

export type RefinementListItemProps = {
  facetValueToRefine: string;
  handleClick: (args: {
    facetValueToRefine: string;
    isRefined: boolean;
    originalEvent: MouseEvent;
  }) => void;
  isRefined: boolean;
  subItems?: JSX.Element;
  templateData: Record<string, any>;
  templateKey: string;
  templateProps?: Record<string, any>;
  className: string;
};

function RefinementListItem({
  className,
  handleClick,
  facetValueToRefine,
  isRefined,
  templateProps,
  templateKey,
  templateData,
  subItems,
}: RefinementListItemProps) {
  return (
    <li
      className={className}
      onClick={(originalEvent) => {
        handleClick({
          facetValueToRefine,
          isRefined,
          originalEvent,
        });
      }}
    >
      {/* @MAJOR ensure conformity with InstantSearch.css specs */}
      <Template
        {...templateProps}
        templateKey={templateKey}
        data={templateData}
      />
      {subItems}
    </li>
  );
}

export default RefinementListItem;
