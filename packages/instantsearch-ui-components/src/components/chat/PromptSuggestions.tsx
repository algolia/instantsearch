/** @jsx createElement */
/** @jsxFrag Fragment */
import { cx } from '../../lib';
import { createButtonComponent } from '../Button';

import type { ComponentProps, Renderer } from '../../types';

export type PromptSuggestionsClassNames = {
  root?: string | string[];
  header?: string | string[];
  headerTitle?: string | string[];
  suggestion?: string | string[];
  skeleton?: string | string[];
  skeletonItem?: string | string[];
};

export type PromptSuggestionsTranslations = {
  /**
   * The title displayed in the header.
   */
  headerTitle: string;
};

export type PromptSuggestionsHeaderComponentProps = {
  classNames: Partial<
    Pick<PromptSuggestionsClassNames, 'header' | 'headerTitle'>
  >;
  translations: PromptSuggestionsTranslations;
};

export type PromptSuggestionsOwnProps = ComponentProps<'div'> & {
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
    | ((props: PromptSuggestionsHeaderComponentProps) => JSX.Element)
    | false;
  /**
   * Optional translations for the component.
   */
  translations?: Partial<PromptSuggestionsTranslations>;
  /**
   * Optional class names for elements
   */
  classNames?: Partial<PromptSuggestionsClassNames>;
};

export function createPromptSuggestionsComponent({
  createElement,
}: Renderer) {
  const Button = createButtonComponent({ createElement });

  function DefaultHeader({
    classNames,
    translations,
  }: PromptSuggestionsHeaderComponentProps) {
    return (
      <div
        className={cx('ais-PromptSuggestions-header', classNames.header)}
      >
        <span
          className={cx(
            'ais-PromptSuggestions-headerTitle',
            classNames.headerTitle
          )}
        >
          {translations.headerTitle}
        </span>
      </div>
    );
  }

  return function PromptSuggestions(
    userProps: PromptSuggestionsOwnProps
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

    const translations: PromptSuggestionsTranslations = {
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
          'ais-PromptSuggestions',
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
              'ais-PromptSuggestions-skeleton',
              classNames.skeleton
            )}
          >
            {[...new Array(skeletonCount)].map((_, i) => (
              <div
                key={i}
                className={cx(
                  'ais-PromptSuggestions-skeletonItem',
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
                'ais-PromptSuggestions-suggestion',
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
