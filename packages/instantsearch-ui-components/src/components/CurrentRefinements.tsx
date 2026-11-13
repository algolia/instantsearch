/** @jsx createElement */
import { capitalize, isSpecialClick } from 'instantsearch-core';

import { cx } from '../lib';

import type { ComponentProps, Renderer } from '../types';

export type CurrentRefinementsRefinement = {
  /**
   * The attribute on which the refinement is applied
   */
  attribute?: string;
  /**
   * The type of the refinement
   */
  type?: string;
  /**
   * The raw value of the refinement
   */
  value?: string | number | boolean | Array<string | number | boolean>;
  /**
   * The label of the refinement to display
   */
  label: string;
  /**
   * The value of the operator (only if applicable)
   */
  operator?: string;
  /**
   * The number of found items (only if applicable)
   */
  count?: number | null;
  /**
   * Whether the count is exhaustive (only if applicable)
   */
  exhaustive?: boolean;
};

export type CurrentRefinementsItem = {
  /**
   * The index name
   */
  indexName?: string;
  /**
   * The index id
   */
  indexId?: string;
  /**
   * The attribute on which the refinements are applied
   */
  attribute?: string;
  /**
   * The textual representation of this attribute
   */
  label: string;
  /**
   * Currently applied refinements
   */
  refinements: CurrentRefinementsRefinement[];
  /**
   * Removes the given refinement and triggers a new search
   */
  refine(refinement: CurrentRefinementsRefinement): void;
};

export type CurrentRefinementsClassNames = {
  /**
   * Class names to apply to the root element
   */
  root: string | string[];
  /**
   * Class names to apply to the root element when there are no refinements
   */
  noRefinementRoot: string | string[];
  /**
   * Class names to apply to the list element
   */
  list: string | string[];
  /**
   * Class names to apply to each refinement
   */
  item: string | string[];
  /**
   * Class names to apply to the label of each refinement
   */
  label: string | string[];
  /**
   * Class names to apply to the container of each refinement's value
   */
  category: string | string[];
  /**
   * Class names to apply to the text element of each refinement's value
   */
  categoryLabel: string | string[];
  /**
   * Class names to apply to each refinement's delete button
   */
  delete: string | string[];
};

export type CurrentRefinementsProps = ComponentProps<'div'> & {
  classNames?: Partial<CurrentRefinementsClassNames>;
  items?: CurrentRefinementsItem[];
  /**
   * Whether there are refinements to remove
   */
  canRefine?: boolean;
  /**
   * Overrides the rendering of each refinement group
   */
  itemComponent?: (props: {
    item: CurrentRefinementsItem;
    className: string;
    key?: string | number;
  }) => JSX.Element;
  /**
   * Overrides the rendering of each refinement (the category element, including the delete button)
   */
  refinementComponent?: (props: {
    refinement: CurrentRefinementsRefinement;
    item: CurrentRefinementsItem;
    className: string;
    key?: string | number;
  }) => JSX.Element;
};

function createItemKey({
  attribute,
  value,
  type,
  operator,
  label,
}: CurrentRefinementsRefinement): string {
  // All identity fields are optional in the public type; the required label
  // is the fallback so sibling refinements like `{label: 'Apple'}` and
  // `{label: 'Samsung'}` never collapse onto the same key. Falsy-but-valid
  // values (`0`, `''`, `false`) must serialize, hence the explicit filter
  // instead of `filter(Boolean)`.
  return [attribute, type, value ?? label, operator]
    .filter((part) => part !== undefined && part !== null)
    .join(':');
}

function createGroupKey(item: CurrentRefinementsItem): string {
  // The index id disambiguates scoped indices searching the same index.
  return [item.indexId ?? item.indexName, item.attribute, item.label]
    .filter((part) => part !== undefined && part !== null)
    .join('/');
}

function createGroupKeys(items: CurrentRefinementsItem[]): string[] {
  const metadataKeys = items.map(createGroupKey);
  const counts = new Map<string, number>();
  metadataKeys.forEach((key) => {
    counts.set(key, (counts.get(key) ?? 0) + 1);
  });

  // Groups can share metadata when `transformItems` splits an attribute into
  // sibling groups (e.g. a numeric attribute rendered as several groups with
  // the same label). Those siblings need a discriminator to reconcile
  // distinctly, but only they do: adding the position to every key would
  // re-key unaffected groups when a preceding group disappears and remount
  // their DOM.
  return metadataKeys.map((key, index) =>
    counts.get(key) === 1 ? key : `${key}/${index}`
  );
}

export function createCurrentRefinementsComponent({ createElement }: Renderer) {
  function DefaultRefinement({
    item,
    refinement,
    className,
    classNames,
  }: {
    item: CurrentRefinementsItem;
    refinement: CurrentRefinementsRefinement;
    className: string;
    classNames: Partial<CurrentRefinementsClassNames>;
    // The rendering key, stripped by the renderer before the props reach us.
    key?: string | number;
  }) {
    return (
      <span key={createItemKey(refinement)} className={className}>
        <span
          className={cx(
            'ais-CurrentRefinements-categoryLabel',
            classNames.categoryLabel
          )}
        >
          {refinement.attribute === 'query' ? (
            <q>{refinement.label}</q>
          ) : (
            refinement.label
          )}
        </span>
        <button
          type="button"
          onClick={(event) => {
            if (isSpecialClick(event as unknown as MouseEvent)) {
              return;
            }

            item.refine(refinement);
          }}
          className={cx('ais-CurrentRefinements-delete', classNames.delete)}
        >
          ✕
        </button>
      </span>
    );
  }

  function DefaultItem({
    item,
    className,
    classNames,
    refinementComponent,
    groupKey,
  }: {
    item: CurrentRefinementsItem;
    className: string;
    classNames: Partial<CurrentRefinementsClassNames>;
    refinementComponent?: CurrentRefinementsProps['refinementComponent'];
    // The group key from the list, carrying the position discriminator.
    groupKey?: string;
    // The rendering key, stripped by the renderer before the props reach us.
    key?: string | number;
  }) {
    return (
      <li key={groupKey ?? createGroupKey(item)} className={className}>
        <span className={cx('ais-CurrentRefinements-label', classNames.label)}>
          {capitalize(item.label)}:{' '}
        </span>
        {item.refinements.map((refinement) => {
          const Refinement = refinementComponent!;
          const className = cx(
            'ais-CurrentRefinements-category',
            classNames.category
          );
          const key = createItemKey(refinement);

          return refinementComponent ? (
            <Refinement
              key={key}
              item={item}
              refinement={refinement}
              className={className}
            />
          ) : (
            <DefaultRefinement
              key={key}
              item={item}
              refinement={refinement}
              className={className}
              classNames={classNames}
            />
          );
        })}
      </li>
    );
  }

  return function CurrentRefinements(userProps: CurrentRefinementsProps) {
    const {
      classNames = {},
      items = [],
      canRefine = false,
      itemComponent: ItemComponent,
      refinementComponent: RefinementComponent,
      ...props
    } = userProps;

    const groupKeys = createGroupKeys(items);

    return (
      <div
        {...props}
        className={cx(
          'ais-CurrentRefinements',
          classNames.root,
          !canRefine &&
            cx(
              'ais-CurrentRefinements--noRefinement',
              classNames.noRefinementRoot
            ),
          props.className
        )}
      >
        <ul className={cx('ais-CurrentRefinements-list', classNames.list)}>
          {items.map((item, index) => {
            const className = cx(
              'ais-CurrentRefinements-item',
              classNames.item
            );
            const key = groupKeys[index];

            return ItemComponent ? (
              <ItemComponent key={key} item={item} className={className} />
            ) : (
              <DefaultItem
                key={key}
                groupKey={key}
                item={item}
                className={className}
                classNames={classNames}
                refinementComponent={RefinementComponent}
              />
            );
          })}
        </ul>
      </div>
    );
  };
}
