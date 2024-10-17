import { useConfigure } from '../connectors/useConfigure';

import type { UseConfigureProps } from '../connectors/useConfigure';

export type ConfigureProps = UseConfigureProps;

export function Configure(props: ConfigureProps) {
  useConfigure(
    Object.keys(props).reduce<ConfigureProps>((acc, key) => {
      if (key.slice(0, 6) === 'data-') {
        return acc;
      }
      // @ts-ignore
      acc[key] = props[key];
      return acc;
    }, {}),
    { $$widgetType: 'ais.configure' }
  );

  return null;
}
