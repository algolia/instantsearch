import React from 'react';
import { useQueryRules, UseQueryRulesProps } from 'react-instantsearch-hooks';

import { cx } from '../cx';

export type QueryRuleCustomDataProps = Omit<
  React.ComponentProps<'div'>,
  'children'
> &
  Partial<Pick<UseQueryRulesProps, 'transformItems'>> & {
    children: (options: { items: any[] }) => React.ReactNode;
  };

export function QueryRuleCustomData(props: QueryRuleCustomDataProps) {
  const { items } = useQueryRules(props);
  return (
    <div className={cx('ais-QueryRuleCustomData', props.className)}>
      {props.children({ items })}
    </div>
  );
}
