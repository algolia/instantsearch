import connectHits from 'instantsearch.js/es/connectors/hits/connectHits';
import React, { createElement } from 'react';

import { useConnector } from '../hooks/useConnector';

import type { AdditionalWidgetProperties } from '../hooks/useConnector';
import type { BaseHit, Hit } from 'instantsearch.js';
import type {
  HitsConnectorParams,
  HitsWidgetDescription,
  HitsConnector,
} from 'instantsearch.js/es/connectors/hits/connectHits';

export type UseHitsProps<THit extends BaseHit = BaseHit> =
  HitsConnectorParams<THit>;

type GetHitPropsType = ({ hit }: { hit: Hit }) => {
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

  function HitWrapper({ hit, children }: { hit: Hit<THit>; children: any }) {
    if (
      children &&
      (Array.isArray(children) || children.type === React.Fragment)
    ) {
      if (__DEV__) {
        // eslint-disable-next-line no-console
        console.warn(
          'Adjacent JSX elements in <HitWrapper> must be wrapped in an enclosing tag that is not a Fragment.'
        );
      }
      return children;
    }

    const onClick = () => {
      // eslint-disable-next-line no-unused-expressions
      children?.props.onClick?.();
      output.sendEvent(
        'click:internal',
        hit,
        'Internal useHit HitWrapper: Hit Clicked'
      );
    };

    const root = createElement(children.type, { ...children.props, onClick });

    return createElement(React.Fragment, null, root);
  }

  const getHitProps: GetHitPropsType = ({ hit }) => {
    return {
      onClick() {
        output.sendEvent(
          'click:internal',
          hit,
          'Internal useHit getHitProps: Hit Clicked'
        );
      },
    };
  };

  return {
    ...output,
    HitWrapper,
    getHitProps,
  };
}
