import React from 'react';
import { connectQueryRules } from 'react-instantsearch-core';
import PanelCallbackHandler from '../components/PanelCallbackHandler';
import type { QueryRuleCustomDataProps } from '../components/QueryRuleCustomData';
import QueryRuleCustomData from '../components/QueryRuleCustomData';

type CustomUserData = {
  [key: string]: any;
};

const QueryRuleCustomDataWidget: React.FC<
  QueryRuleCustomDataProps<CustomUserData>
> = (props) => (
  <PanelCallbackHandler {...props}>
    <QueryRuleCustomData {...props} />
  </PanelCallbackHandler>
);

export default connectQueryRules(QueryRuleCustomDataWidget, {
  $$widgetType: 'ais.queryRuleCustomData',
});
