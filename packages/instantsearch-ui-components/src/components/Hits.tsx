/** @jsx createElement */
import { cx } from '../lib';

import type { Renderer } from '../types';
import type { Hit } from 'instantsearch.js';
import type { SendEventForHits } from 'instantsearch.js/es/lib/utils';

export type HitsProps<THit> = React.ComponentProps<'div'> & {
  hits: THit[];
  itemComponent: (props: {
    hit: THit;
    index: number;
    className: string;
    onClick: () => void;
    onAuxClick: () => void;
  }) => JSX.Element;
  sendEvent: SendEventForHits;
  classNames?: Partial<HitsClassNames>;
  emptyComponent?: (props: { className: string }) => JSX.Element;
};

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

export function createHits({ createElement }: Renderer) {
  return <THit extends Hit>({
    classNames = {},
    hits,
    itemComponent: ItemComponent,
    sendEvent,
    emptyComponent: EmptyComponent,
    ...props
  }: HitsProps<THit>) => {
    if (hits.length === 0 && EmptyComponent) {
      return (
        <EmptyComponent
          className={cx(
            'ais-Hits',
            classNames.root,
            cx('ais-Hits--empty', classNames.emptyRoot),
            props.className
          )}
        />
      );
    }
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
          {hits.map((hit, index) => (
            <ItemComponent
              key={hit.objectID}
              hit={hit}
              index={index}
              className={cx('ais-Hits-item', classNames.item)}
              onClick={() => {
                sendEvent('click:internal', hit, 'Hit Clicked');
              }}
              onAuxClick={() => {
                sendEvent('click:internal', hit, 'Hit Clicked');
              }}
            />
          ))}
        </ol>
      </div>
    );
  };
}
