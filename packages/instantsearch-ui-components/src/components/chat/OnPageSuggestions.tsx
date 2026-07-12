/** @jsx createElement */
/** @jsxFrag Fragment */
import { cx } from '../../lib';
import { createButtonComponent } from '../Button';

import type { ComponentProps, Renderer } from '../../types';

export type OnPageSuggestionsClassNames = {
  root?: string | string[];
  header?: string | string[];
  headerTitle?: string | string[];
  suggestion?: string | string[];
  skeleton?: string | string[];
  skeletonItem?: string | string[];
};

export type OnPageSuggestionsTranslations = {
  /**
   * The title displayed in the header.
   */
  headerTitle: string;
};

export type OnPageSuggestionsHeaderComponentProps = {
  classNames: Partial<
    Pick<OnPageSuggestionsClassNames, 'header' | 'headerTitle'>
  >;
  translations: OnPageSuggestionsTranslations;
};

export type OnPageSuggestionsOwnProps = ComponentProps<'div'> & {
  /*
   * List of prompt suggestions.
   */
  suggestions?: string[];
  /*
   * Callback when a suggestion is clicked.
   */
  onSuggestionClick: (suggestion: string) => void;
  /**
   * Whether suggestions are currently being fetched. When true and
   * `suggestions` is empty, renders `skeletonCount` placeholder pills.
   */
  isLoading?: boolean;
  /**
   * Number of skeleton placeholder pills shown while loading.
   * @default 3
   */
  skeletonCount?: number;
  /**
   * Disables every pill (e.g. when a downstream chat is mid-stream).
   */
  disabled?: boolean;
  /**
   * Component to render the header. Set to `false` to disable the header.
   */
  headerComponent?:
    | ((props: OnPageSuggestionsHeaderComponentProps) => JSX.Element)
    | false;
  /**
   * Optional translations for the component.
   */
  translations?: Partial<OnPageSuggestionsTranslations>;
  /**
   * Optional class names for elements
   */
  classNames?: Partial<OnPageSuggestionsClassNames>;
};

export function createOnPageSuggestionsComponent({
  createElement,
}: Renderer) {
  const Button = createButtonComponent({ createElement });

  function DefaultHeader({
    classNames,
    translations,
  }: OnPageSuggestionsHeaderComponentProps) {
    return (
      <div
        className={cx('ais-OnPageSuggestions-header', classNames.header)}
      >
        <span
          className={cx(
            'ais-OnPageSuggestions-headerTitle',
            classNames.headerTitle
          )}
        >
          {translations.headerTitle}
        </span>
      </div>
    );
  }

  return function OnPageSuggestions(
    userProps: OnPageSuggestionsOwnProps
  ) {
    const {
      suggestions = [],
      onSuggestionClick,
      isLoading = false,
      skeletonCount = 3,
      disabled = false,
      headerComponent,
      translations: userTranslations,
      classNames = {},
      ...props
    } = userProps;

    const translations: OnPageSuggestionsTranslations = {
      headerTitle: 'Suggestions',
      ...userTranslations,
    };

    const HeaderComponent =
      headerComponent === false ? null : headerComponent ?? DefaultHeader;

    const hasContent = suggestions.length > 0 || isLoading;

    return (
      <div
        {...props}
        className={cx(
          'ais-OnPageSuggestions',
          classNames.root,
          props.className
        )}
      >
        {HeaderComponent && hasContent && (
          <HeaderComponent
            classNames={{
              header: classNames.header,
              headerTitle: classNames.headerTitle,
            }}
            translations={translations}
          />
        )}
        {isLoading && suggestions.length === 0 ? (
          <div
            className={cx(
              'ais-OnPageSuggestions-skeleton',
              classNames.skeleton
            )}
          >
            {[...new Array(skeletonCount)].map((_, i) => (
              <div
                key={i}
                className={cx(
                  'ais-OnPageSuggestions-skeletonItem',
                  classNames.skeletonItem
                )}
              />
            ))}
          </div>
        ) : (
          suggestions.map((suggestion, index) => (
            <Button
              key={index}
              size="sm"
              variant="primary"
              className={cx(
                'ais-OnPageSuggestions-suggestion',
                classNames.suggestion
              )}
              onClick={() => onSuggestionClick(suggestion)}
              disabled={disabled}
            >
              {suggestion}
            </Button>
          ))
        )}
      </div>
    );
  };
}
