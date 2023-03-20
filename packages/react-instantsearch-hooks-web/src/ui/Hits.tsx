import React from 'react';

import { cx } from './lib/cx';

import type { Hit } from 'instantsearch.js';
import type { SendEventForHits } from 'instantsearch.js/es/lib/utils';

export type HitsProps<THit> = React.ComponentProps<'div'> & {
  hits: THit[];
  sendEvent: SendEventForHits;
  hitComponent?: React.JSXElementConstructor<{
    hit: THit;
    sendEvent: SendEventForHits;
  }>;
  classNames?: Partial<HitsClassNames>;
};

function DefaultHitComponent({ hit }: { hit: Hit }) {
  return (
    <div style={{ wordBreak: 'break-all' }}>
      {JSON.stringify(hit).slice(0, 100)}…
    </div>
  );
}

export type HitsClassNames = {
  /**
   * Class names to apply to the root element
   */
  root: string;
  /**
   * Class names to apply to the root element without results
   */
  emptyRoot: string;
  /**
   * Class names to apply to the list element
   */
  list: string;
  /**
   * Class names to apply to each item element
   */
  item: string;
};

export function Hits<THit extends Hit>({
  hits,
  sendEvent,
  hitComponent: HitComponent = DefaultHitComponent,
  classNames = {},
  ...props
}: HitsProps<THit>) {
  return (
    <div
      {...props}
      className={cx(
        'ais-Hits',
        classNames.root,
        hits.length === 0 && cx('ais-Hits--empty', classNames.emptyRoot),
        props.className
      )}
    >
      <ol className={cx('ais-Hits-list', classNames.list)}>
        {hits.map((hit) => (
          <li
            key={hit.objectID}
            className={cx('ais-Hits-item', classNames.item)}
            onClick={() => {
              sendEvent('click:internal', hit, 'Hit Clicked');
            }}
          >
            <HitComponent hit={hit} sendEvent={sendEvent} />
          </li>
        ))}
      </ol>
    </div>
  );
}
