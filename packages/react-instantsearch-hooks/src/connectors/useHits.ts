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

    const onClick = () => {
      children.props.onClick?.();
      output.sendEvent('click:internal', hit, 'HitWrapper: Hit clicked');
    };

    const root = createElement(children.type, { ...children.props, onClick });

    return createElement(React.Fragment, null, root);
  }

  const getHitProps: GetHitsPropsType = ({ hit }) => {
    return {
      onClick() {
        output.sendEvent('click:internal', hit, 'getHitProps: Hit clicked');
      },
    };
  };

  return {
    ...output,
    HitWrapper,
    getHitProps,
  };
}
