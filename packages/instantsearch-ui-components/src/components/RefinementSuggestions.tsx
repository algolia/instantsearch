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
  /**
   * Whether this refinement is currently applied.
   */
  isRefined: boolean;
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

  return function RefinementSuggestions(
    userProps: RefinementSuggestionsProps
  ): JSX.Element | null {
    const {
      classNames = {},
      suggestions,
      isLoading,
      onRefine,
      skeletonCount = 3,
      ...props
    } = userProps;

    const isEmpty = suggestions.length === 0;

    if (isEmpty && !isLoading) {
      return null;
    }

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
                  classNames.item,
                  suggestion.isRefined &&
                    cx(
                      'ais-RefinementSuggestions-item--refined',
                      classNames.itemRefined
                    )
                )}
              >
                <Button
                  variant={suggestion.isRefined ? 'primary' : 'outline'}
                  size="sm"
                  className={cx(classNames.button)}
                  onClick={() =>
                    onRefine(suggestion.attribute, suggestion.value)
                  }
                >
                  <span
                    className={cx(
                      'ais-RefinementSuggestions-label',
                      classNames.label
                    )}
                  >
                    {suggestion.label}: {suggestion.value}
                  </span>
                  <span
                    className={cx(
                      'ais-RefinementSuggestions-nbHits',
                      classNames.count
                    )}
                  >
                    {suggestion.count}
                  </span>
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };
}
