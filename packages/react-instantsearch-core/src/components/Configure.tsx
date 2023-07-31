import { useConfigure } from '../connectors/useConfigure';

import type { UseConfigureProps } from '../connectors/useConfigure';

export type ConfigureProps = UseConfigureProps;

export function Configure(props: ConfigureProps) {
  useConfigure(props, { $$widgetType: 'ais.configure' });

  return null;
}
