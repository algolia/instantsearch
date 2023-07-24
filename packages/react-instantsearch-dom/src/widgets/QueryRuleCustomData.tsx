import React from 'react';
import { connectQueryRules } from 'react-instantsearch-core';

import PanelCallbackHandler from '../components/PanelCallbackHandler';
import QueryRuleCustomData from '../components/QueryRuleCustomData';

import type { QueryRuleCustomDataProps } from '../components/QueryRuleCustomData';

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
