import type {
  ConnectedComponentClass,
  ConnectorProvided,
} from 'react-instantsearch-core';

type AdditionalWidgetProperties = {
  $$widgetType?: string;
};

export type Connector<TProvided = {}, TExposed = {}> = ((
  stateless: React.FunctionComponent<ConnectorProvided<TProvided>>,
  additionalWidgetProperties: AdditionalWidgetProperties
) => React.ComponentClass<TExposed>) &
  (<TProps extends Partial<ConnectorProvided<TProvided>>>(
    Composed: React.ComponentType<TProps>,
    additionalWidgetProperties: AdditionalWidgetProperties
  ) => ConnectedComponentClass<TProps, ConnectorProvided<TProvided>, TExposed>);
