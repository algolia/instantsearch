/** @jsx h */

import { h } from 'preact';
import { isSpecialClick, capitalize } from '../../lib/utils';
import {
  CurrentRefinementsConnectorParamsItem,
  CurrentRefinementsConnectorParamsRefinement,
} from '../../connectors/current-refinements/connectCurrentRefinements';
import { CurrentRefinementsCSSClasses } from '../../widgets/current-refinements/current-refinements';

export type CurrentRefinementsComponentCSSClasses = {
  [TClassName in keyof CurrentRefinementsCSSClasses]: string;
};

export type CurrentRefinementsProps = {
  items: CurrentRefinementsConnectorParamsItem[];
  cssClasses: CurrentRefinementsComponentCSSClasses;
};

const createItemKey = ({
  attribute,
  value,
  type,
  operator,
}: CurrentRefinementsConnectorParamsRefinement): string =>
  [attribute, type, value, operator]
    .map(key => key)
    .filter(Boolean)
    .join(':');

const handleClick = (callback: () => void) => (event: any) => {
  if (isSpecialClick(event)) {
    return;
  }

  event.preventDefault();
  callback();
};

const CurrentRefinements = ({ items, cssClasses }: CurrentRefinementsProps) => (
  <div className={cssClasses.root}>
    <ul className={cssClasses.list}>
      {items.map((item, index) => (
        <li
          key={`${item.indexName}-${item.attribute}-${index}`}
          className={cssClasses.item}
        >
          <span className={cssClasses.label}>{capitalize(item.label)}:</span>

          {item.refinements.map(refinement => (
            <span
              key={createItemKey(refinement)}
              className={cssClasses.category}
            >
              <span className={cssClasses.categoryLabel}>
                {refinement.attribute === 'query' ? (
                  <q>{refinement.label}</q>
                ) : (
                  refinement.label
                )}
              </span>

              <button
                className={cssClasses.delete}
                onClick={handleClick(item.refine.bind(null, refinement))}
              >
                ✕
              </button>
            </span>
          ))}
        </li>
      ))}
    </ul>
  </div>
);

export default CurrentRefinements;
