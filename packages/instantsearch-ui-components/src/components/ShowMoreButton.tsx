/** @jsx createElement */
import { cx } from '../lib';

import type { Renderer } from '../types';

export type ShowMoreButtonTranslations = {
  /**
   * The text of the "Show more" button.
   */
  showMoreButtonText: (options: { isShowingMore: boolean }) => string;
  /**
   * Accessible name (aria-label) for the "Show more" button.
   */
  showMoreButtonLabel?: string;
};

export const defaultShowMoreButtonTranslations: ShowMoreButtonTranslations = {
  showMoreButtonText({ isShowingMore }) {
    return isShowingMore ? 'Show less' : 'Show more';
  },
};

export type ShowMoreButtonProps = {
  /**
   * The widget's `ais-*` block name, for example `Menu`.
   */
  widgetName: string;
  canToggleShowMore: boolean;
  isShowingMore: boolean;
  onToggleShowMore?: () => void;
  /**
   * Overrides the content of the button.
   */
  showMoreTextComponent?: (props: {
    isShowingMore: boolean;
  }) => JSX.Element | string | null;
  classNames: {
    showMore?: string | string[];
    disabledShowMore?: string | string[];
  };
  translations: ShowMoreButtonTranslations;
};

// Internal: the "Show more" button shared by the menu-like widgets.
export function createShowMoreButtonComponent({ createElement }: Renderer) {
  return function ShowMoreButton(userProps: ShowMoreButtonProps) {
    const {
      widgetName,
      canToggleShowMore,
      isShowingMore,
      onToggleShowMore,
      showMoreTextComponent,
      classNames,
      translations,
    } = userProps;

    return (
      <button
        className={cx(
          `ais-${widgetName}-showMore`,
          classNames.showMore,
          !canToggleShowMore &&
            cx(
              `ais-${widgetName}-showMore--disabled`,
              classNames.disabledShowMore
            )
        )}
        disabled={!canToggleShowMore}
        onClick={onToggleShowMore}
        aria-expanded={isShowingMore}
        aria-label={translations.showMoreButtonLabel}
      >
        {showMoreTextComponent
          ? showMoreTextComponent({ isShowingMore })
          : translations.showMoreButtonText({ isShowingMore })}
      </button>
    );
  };
}
