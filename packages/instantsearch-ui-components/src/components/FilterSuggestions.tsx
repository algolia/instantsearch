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

export type FilterSuggestionsItemComponentProps = {
  suggestion: Suggestion;
  classNames: Partial<
    Pick<FilterSuggestionsClassNames, 'item' | 'button' | 'label' | 'count'>
  >;
  refine: () => void;
};

export type FilterSuggestionsHeaderComponentProps = {
  classNames: Partial<
    Pick<FilterSuggestionsClassNames, 'header' | 'headerIcon' | 'headerTitle'>
  >;
};

export type FilterSuggestionsEmptyComponentProps = {
  classNames: Partial<Pick<FilterSuggestionsClassNames, 'emptyRoot'>>;
};

export type FilterSuggestionsProps = ComponentProps<'div'> & {
  suggestions: Suggestion[];
  isLoading: boolean;
  refine: (attribute: string, value: string) => void;
  classNames?: Partial<FilterSuggestionsClassNames>;
  /**
   * Number of skeleton items to show when loading.
   * @default 3
   */
  skeletonCount?: number;
  /**
   * Component to render each suggestion item.
   */
  itemComponent?: (props: FilterSuggestionsItemComponentProps) => JSX.Element;
  /**
   * Component to render the header. Set to `false` to disable the header.
   */
  headerComponent?:
    | ((props: FilterSuggestionsHeaderComponentProps) => JSX.Element)
    | false;
  /**
   * Component to render when there are no suggestions.
   */
  emptyComponent?: (
    props: FilterSuggestionsEmptyComponentProps
  ) => JSX.Element | null;
};

export type FilterSuggestionsClassNames = {
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
   * Class names to apply to the skeleton container element
   */
  skeleton: string | string[];
  /**
   * Class names to apply to each skeleton item element
   */
  skeletonItem: string | string[];
  /**
   * Class names to apply to the list element
   */
  list: string | string[];
  /**
   * Class names to apply to each item element
   */
  item: string | string[];
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

export function createFilterSuggestionsComponent({ createElement }: Renderer) {
  const Button = createButtonComponent({ createElement });

  function DefaultHeader({
    classNames,
  }: FilterSuggestionsHeaderComponentProps) {
    return (
      <div className={cx('ais-FilterSuggestions-header', classNames.header)}>
        <span
          className={cx(
            'ais-FilterSuggestions-headerIcon',
            classNames.headerIcon
          )}
        >
          <SparklesIcon createElement={createElement} />
        </span>
        <span
          className={cx(
            'ais-FilterSuggestions-headerTitle',
            classNames.headerTitle
          )}
        >
          Filter suggestions
        </span>
      </div>
    );
  }

  function DefaultItem({
    suggestion,
    classNames,
    refine,
  }: FilterSuggestionsItemComponentProps) {
    return (
      <Button
        variant="outline"
        size="sm"
        className={cx(classNames.button)}
        onClick={refine}
      >
        <span className={cx('ais-FilterSuggestions-label', classNames.label)}>
          {suggestion.label}: {suggestion.value}
        </span>
        <span className={cx('ais-FilterSuggestions-count', classNames.count)}>
          {suggestion.count}
        </span>
      </Button>
    );
  }

  return function FilterSuggestions(
    userProps: FilterSuggestionsProps
  ): JSX.Element | null {
    const {
      classNames = {},
      suggestions,
      isLoading,
      refine,
      skeletonCount = 3,
      itemComponent: ItemComponent = DefaultItem,
      headerComponent,
      emptyComponent: EmptyComponent,
      ...props
    } = userProps;

    const HeaderComponent =
      headerComponent === false ? null : headerComponent ?? DefaultHeader;

    const isEmpty = suggestions.length === 0;

    if (isEmpty && !isLoading) {
      return (
        <div
          {...props}
          className={cx(
            'ais-FilterSuggestions',
            classNames.root,
            'ais-FilterSuggestions--empty',
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

    const headerClassNames: FilterSuggestionsHeaderComponentProps['classNames'] =
      {
        header: classNames.header,
        headerIcon: classNames.headerIcon,
        headerTitle: classNames.headerTitle,
      };

    const itemClassNames: FilterSuggestionsItemComponentProps['classNames'] = {
      item: classNames.item,
      button: classNames.button,
      label: classNames.label,
      count: classNames.count,
    };

    return (
      <div
        {...props}
        className={cx(
          'ais-FilterSuggestions',
          classNames.root,
          isLoading &&
            cx('ais-FilterSuggestions--loading', classNames.loadingRoot),
          props.className
        )}
      >
        {HeaderComponent && <HeaderComponent classNames={headerClassNames} />}
        {isLoading ? (
          <div
            className={cx(
              'ais-FilterSuggestions-skeleton',
              classNames.skeleton
            )}
          >
            {[...new Array(skeletonCount)].map((_, i) => (
              <div
                key={i}
                className={cx(
                  'ais-FilterSuggestions-skeletonItem',
                  classNames.skeletonItem
                )}
              />
            ))}
          </div>
        ) : (
          <ul className={cx('ais-FilterSuggestions-list', classNames.list)}>
            {suggestions.map((suggestion) => (
              <li
                key={`${suggestion.attribute}-${suggestion.value}`}
                className={cx('ais-FilterSuggestions-item', classNames.item)}
              >
                <ItemComponent
                  suggestion={suggestion}
                  classNames={itemClassNames}
                  refine={() => refine(suggestion.attribute, suggestion.value)}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };
}
