import React from 'react';
import { useBreadcrumb } from 'react-instantsearch-hooks';

import { Breadcrumb as BreadcrumbUiComponent } from '../ui/Breadcrumb';

import type { BreadcrumbProps as BreadcrumbUiProps } from '../ui/Breadcrumb';
import type { UseBreadcrumbProps } from 'react-instantsearch-hooks';

type UiProps = Pick<
  BreadcrumbUiProps,
  'items' | 'hasItems' | 'createURL' | 'onNavigate' | 'translations'
>;

export type BreadcrumbProps = Omit<BreadcrumbUiProps, keyof UiProps> &
  Omit<UseBreadcrumbProps, 'separator'> & {
    translations?: Partial<UiProps['translations']>;
  };

export function Breadcrumb({
  attributes,
  rootPath,
  separator,
  transformItems,
  translations,
  ...props
}: BreadcrumbProps) {
  const { canRefine, createURL, items, refine } = useBreadcrumb(
    {
      attributes,
      rootPath,
      transformItems,
    },
    { $$widgetType: 'ais.breadcrumb' }
  );

  const uiProps: UiProps = {
    items,
    hasItems: canRefine,
    createURL,
    onNavigate: refine,
    translations: { rootElementText: 'Home', ...translations },
  };

  return <BreadcrumbUiComponent {...props} {...uiProps} />;
}
