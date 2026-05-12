import React from 'react';
import { useRatingMenu } from 'react-instantsearch-core';

import { RatingMenu as RatingMenuUiComponent } from '../ui/RatingMenu';

import type { RatingMenuProps as RatingMenuUiComponentProps } from '../ui/RatingMenu';
import type { UseRatingMenuProps } from 'react-instantsearch-core';

type UiProps = Pick<
  RatingMenuUiComponentProps,
  'items' | 'createURL' | 'onRefine'
>;

export type RatingMenuProps = Omit<RatingMenuUiComponentProps, keyof UiProps> &
  UseRatingMenuProps;

export function RatingMenu({ attribute, max, ...props }: RatingMenuProps) {
  const { items, refine, createURL } = useRatingMenu(
    {
      attribute,
      max,
    },
    {
      $$widgetType: 'ais.ratingMenu',
    }
  );

  const uiProps: UiProps = {
    items,
    createURL,
    onRefine: refine,
  };

  return <RatingMenuUiComponent {...props} {...uiProps} />;
}
