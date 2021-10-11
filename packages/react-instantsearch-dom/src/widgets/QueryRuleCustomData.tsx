import React from 'react';
import type { CustomUserData } from 'react-instantsearch-core';
import { connectQueryRules } from 'react-instantsearch-core';
import PanelCallbackHandler from '../components/PanelCallbackHandler';
import type { QueryRuleCustomDataProps } from '../components/QueryRuleCustomData';
import QueryRuleCustomData from '../components/QueryRuleCustomData';

const QueryRuleCustomDataWidget: React.FC<
  QueryRuleCustomDataProps<CustomUserData>
> = (props) => (
  <PanelCallbackHandler {...props}>
    <QueryRuleCustomData {...props} />
  </PanelCallbackHandler>
);

export default connectQueryRules(QueryRuleCustomDataWidget);
