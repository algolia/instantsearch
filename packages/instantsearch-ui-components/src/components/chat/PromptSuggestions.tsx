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
   * Whether suggestions are currently being fetched. When true and no
   * non-blank suggestion has arrived yet, renders `skeletonCount` placeholder
   * pills; once partial suggestions stream in they render normally but ignore
   * clicks until loading finishes, so an unfinished prompt can't be sent (their
   * appearance is unchanged — only `disabled` styles the pills).
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

export function createPromptSuggestionsComponent({ createElement }: Renderer) {
  const Button = createButtonComponent({ createElement });

  function DefaultHeader({
    classNames,
    translations,
  }: PromptSuggestionsHeaderComponentProps) {
    return (
      <div className={cx('ais-PromptSuggestions-header', classNames.header)}>
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

  return function PromptSuggestions(userProps: PromptSuggestionsOwnProps) {
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
      headerComponent === false ? null : (headerComponent ?? DefaultHeader);

    const visibleSuggestions = suggestions.filter(
      (suggestion) => suggestion.trim() !== ''
    );

    const hasContent = visibleSuggestions.length > 0 || isLoading;

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
        {isLoading && visibleSuggestions.length === 0 ? (
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
          visibleSuggestions.map((suggestion, index) => (
            <Button
              key={index}
              size="sm"
              variant="primary"
              className={cx(
                'ais-PromptSuggestions-suggestion',
                classNames.suggestion
              )}
              // Ignore clicks while streaming so an unfinished prompt (e.g.
              // `Wh..`) can't be sent before generation settles — without
              // toggling `disabled`, which would swap the pill's styling
              // mid-stream.
              onClick={() => {
                if (isLoading) return;
                onSuggestionClick(suggestion);
              }}
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
