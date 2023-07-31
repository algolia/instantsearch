import React from 'react';

type ShowMoreButtonProps = React.ComponentProps<'button'> & {
  isShowingMore: boolean;
  translations: ShowMoreButtonTranslations;
};

export type ShowMoreButtonTextOptions = {
  /**
   * Whether the widget is showing more items or not.
   */
  isShowingMore: boolean;
};

export type ShowMoreButtonTranslations = {
  /**
   * Alternative text for the "Show more" button.
   */
  showMoreButtonText: (options: ShowMoreButtonTextOptions) => string;
};

export function ShowMoreButton({
  isShowingMore,
  translations,
  ...props
}: ShowMoreButtonProps) {
  return (
    <button {...props}>
      {translations.showMoreButtonText({ isShowingMore })}
    </button>
  );
}
