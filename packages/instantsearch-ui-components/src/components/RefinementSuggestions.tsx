/** @jsx createElement */
import { cx } from '../lib';

import { createButtonComponent } from './Button';
import { SparklesIcon } from './chat/icons';

import type { ComponentProps, Renderer } from '../types';

export type Suggestion = {
  /**
   * The facet attribute name.
   */
  attribute: string;
  /**
   * The facet value to filter by.
   */
  value: string;
  /**
   * Human-readable display label.
   */
  label: string;
  /**
   * Number of records matching this filter.
   */
  count: number;
};

export type RefinementSuggestionsItemComponentProps = {
  suggestion: Suggestion;
  classNames: Partial<
    Pick<
      RefinementSuggestionsClassNames,
      'item' | 'itemRefined' | 'button' | 'label' | 'count'
    >
  >;
  onRefine: () => void;
};

export type RefinementSuggestionsHeaderComponentProps = {
  classNames: Partial<
    Pick<
      RefinementSuggestionsClassNames,
      'header' | 'headerIcon' | 'headerTitle'
    >
  >;
};

export type RefinementSuggestionsEmptyComponentProps = {
  classNames: Partial<Pick<RefinementSuggestionsClassNames, 'emptyRoot'>>;
};

export type RefinementSuggestionsProps = ComponentProps<'div'> & {
  suggestions: Suggestion[];
  isLoading: boolean;
  onRefine: (attribute: string, value: string) => void;
  classNames?: Partial<RefinementSuggestionsClassNames>;
  /**
   * Number of skeleton items to show when loading.
   * @default 3
   */
  skeletonCount?: number;
  /**
   * Component to render each suggestion item.
   */
  itemComponent?: (
    props: RefinementSuggestionsItemComponentProps
  ) => JSX.Element;
  /**
   * Component to render the header.
   */
  headerComponent?: (
    props: RefinementSuggestionsHeaderComponentProps
  ) => JSX.Element;
  /**
   * Component to render when there are no suggestions.
   */
  emptyComponent?: (
    props: RefinementSuggestionsEmptyComponentProps
  ) => JSX.Element | null;
};

export type RefinementSuggestionsClassNames = {
  /**
   * Class names to apply to the root element
   */
  root: string | string[];
  /**
   * Class names to apply to the root element when loading
   */
  loadingRoot: string | string[];
  /**
   * Class names to apply to the root element when empty
   */
  emptyRoot: string | string[];
  /**
   * Class names to apply to the header element
   */
  header: string | string[];
  /**
   * Class names to apply to the header icon element
   */
  headerIcon: string | string[];
  /**
   * Class names to apply to the header title element
   */
  headerTitle: string | string[];
  /**
   * Class names to apply to the list element
   */
  list: string | string[];
  /**
   * Class names to apply to each item element
   */
  item: string | string[];
  /**
   * Class names to apply to the item element when refined
   */
  itemRefined: string | string[];
  /**
   * Class names to apply to the button element
   */
  button: string | string[];
  /**
   * Class names to apply to the label element
   */
  label: string | string[];
  /**
   * Class names to apply to the count element
   */
  count: string | string[];
};

export function createRefinementSuggestionsComponent({
  createElement,
}: Renderer) {
  const Button = createButtonComponent({ createElement });

  function DefaultHeader({
    classNames,
  }: RefinementSuggestionsHeaderComponentProps) {
    return (
      <div
        className={cx('ais-RefinementSuggestions-header', classNames.header)}
      >
        <span
          className={cx(
            'ais-RefinementSuggestions-headerIcon',
            classNames.headerIcon
          )}
        >
          <SparklesIcon createElement={createElement} />
        </span>
        <span
          className={cx(
            'ais-RefinementSuggestions-headerTitle',
            classNames.headerTitle
          )}
        >
          Refinement suggestions
        </span>
      </div>
    );
  }

  function DefaultItem({
    suggestion,
    classNames,
    onRefine,
  }: RefinementSuggestionsItemComponentProps) {
    return (
      <Button
        variant="outline"
        size="sm"
        className={cx(classNames.button)}
        onClick={onRefine}
      >
        <span
          className={cx('ais-RefinementSuggestions-label', classNames.label)}
        >
          {suggestion.label}: {suggestion.value}
        </span>
        <span
          className={cx('ais-RefinementSuggestions-nbHits', classNames.count)}
        >
          {suggestion.count}
        </span>
      </Button>
    );
  }

  return function RefinementSuggestions(
    userProps: RefinementSuggestionsProps
  ): JSX.Element | null {
    const {
      classNames = {},
      suggestions,
      isLoading,
      onRefine,
      skeletonCount = 3,
      itemComponent: ItemComponent = DefaultItem,
      headerComponent: HeaderComponent = DefaultHeader,
      emptyComponent: EmptyComponent,
      ...props
    } = userProps;

    const isEmpty = suggestions.length === 0;

    if (isEmpty && !isLoading) {
      return (
        <div
          {...props}
          className={cx(
            'ais-RefinementSuggestions',
            classNames.root,
            'ais-RefinementSuggestions--empty',
            classNames.emptyRoot,
            props.className
          )}
        >
          {EmptyComponent && (
            <EmptyComponent classNames={{ emptyRoot: classNames.emptyRoot }} />
          )}
        </div>
      );
    }

    const headerClassNames: RefinementSuggestionsHeaderComponentProps['classNames'] =
      {
        header: classNames.header,
        headerIcon: classNames.headerIcon,
        headerTitle: classNames.headerTitle,
      };

    const itemClassNames: RefinementSuggestionsItemComponentProps['classNames'] =
      {
        item: classNames.item,
        itemRefined: classNames.itemRefined,
        button: classNames.button,
        label: classNames.label,
        count: classNames.count,
      };

    return (
      <div
        {...props}
        className={cx(
          'ais-RefinementSuggestions',
          classNames.root,
          isLoading &&
            cx('ais-RefinementSuggestions--loading', classNames.loadingRoot),
          props.className
        )}
      >
        <HeaderComponent classNames={headerClassNames} />
        {isLoading ? (
          <div className="ais-RefinementSuggestions-skeleton">
            {[...new Array(skeletonCount)].map((_, i) => (
              <div key={i} className="ais-RefinementSuggestions-skeletonItem" />
            ))}
          </div>
        ) : (
          <ul className={cx('ais-RefinementSuggestions-list', classNames.list)}>
            {suggestions.map((suggestion) => (
              <li
                key={`${suggestion.attribute}-${suggestion.value}`}
                className={cx(
                  'ais-RefinementSuggestions-item',
                  classNames.item
                )}
              >
                <ItemComponent
                  suggestion={suggestion}
                  classNames={itemClassNames}
                  onRefine={() =>
                    onRefine(suggestion.attribute, suggestion.value)
                  }
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };
}
