import React from 'react';

type ShowMoreButtonProps = React.ComponentProps<'button'> & {
  isShowingMore: boolean;
  showMoreCount: number;
  translations: ShowMoreButtonTranslations;
};

export type ShowMoreButtonTextOptions = {
  /**
   * Whether the widget is showing more items or not.
   */
  isShowingMore: boolean;
  /**
   * Total number of facets that can be displayed for 'show more'.
   */
  showMoreCount: number;
};

export type ShowMoreButtonTranslations = {
  /**
   * Alternative text for the "Show more" button.
   */
  showMoreButtonText: (options: ShowMoreButtonTextOptions) => string;
};

export function ShowMoreButton({
  isShowingMore,
  showMoreCount,
  translations,
  ...props
}: ShowMoreButtonProps) {
  return (
    <button {...props}>
      {translations.showMoreButtonText({ isShowingMore, showMoreCount })}
    </button>
  );
}
