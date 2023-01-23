import connectHits from 'instantsearch.js/es/connectors/hits/connectHits';
import React, { createElement } from 'react';

import { useConnector } from '../hooks/useConnector';

import type { AdditionalWidgetProperties } from '../hooks/useConnector';
import type { BaseHit } from 'instantsearch.js';
import type {
  HitsConnectorParams,
  HitsWidgetDescription,
  HitsConnector,
} from 'instantsearch.js/es/connectors/hits/connectHits';

export type UseHitsProps<THit extends BaseHit = BaseHit> =
  HitsConnectorParams<THit>;

type GetHitsPropsType = ({ hit }: { hit: BaseHit }) => {
  onClick: React.MouseEventHandler;
};

export function useHits<THit extends BaseHit = BaseHit>(
  props?: UseHitsProps<THit>,
  additionalWidgetProperties?: AdditionalWidgetProperties
) {
  const output = useConnector<
    HitsConnectorParams<THit>,
    HitsWidgetDescription<THit>
  >(connectHits as HitsConnector<THit>, props, additionalWidgetProperties);

  function HitWrapper({ hit, children }) {
    if (Array.isArray(children) || children.type === React.Fragment) {
      if (__DEV__) {
        console.warn(
          'Adjacent JSX elements in <HitWrapper> must be wrapped in an enclosing tag that is not a Fragment.'
        );
      }
      return children;
    }

    const onClick = (event) => {
      children.props.onClick?.();
      const payload = {
        eventType: 'click',
        eventName: 'Hit clicked',
        queryID: output.results.queryID,
        objectIDs: [hit.objectID],
        positions: [hit.__position],
      };
      console.log({ source: 'HitWrapper', event, payload });
    };
    const root = createElement(children.type, { ...children.props, onClick });

    return React.Fragment({ children: root });
  }

  const getHitProps: GetHitsPropsType = ({ hit }) => {
    return {
      onClick(event) {
        const payload = {
          eventType: 'click',
          eventName: 'Hit clicked',
          queryID: output.results.queryID,
          objectIDs: [hit.objectID],
          positions: [hit.__position],
        };
        console.log({ event, payload });
      },
    };
  };

  return {
    ...output,
    HitWrapper,
    getHitProps,
  };
}
