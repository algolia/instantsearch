import React from 'react';
import { usePoweredBy } from 'react-instantsearch-core';

import { PoweredBy as PoweredByUiComponent } from '../ui/PoweredBy';

import type { PoweredByProps as PoweredByUiComponentProps } from '../ui/PoweredBy';

type UiProps = Pick<PoweredByUiComponentProps, 'url'>;

export type PoweredByProps = Omit<PoweredByUiComponentProps, keyof UiProps>;

export function PoweredBy(props: PoweredByProps) {
  const { url } = usePoweredBy();

  const uiProps: UiProps = {
    url,
  };

  return <PoweredByUiComponent {...props} {...uiProps} />;
}
