import { useConfigure, UseConfigureProps } from 'react-instantsearch-hooks';

export type ConfigureProps = UseConfigureProps;

export function Configure(props: ConfigureProps) {
  useConfigure(props);

  return null;
}
