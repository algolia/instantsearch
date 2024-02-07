/** @jsx createElement */
import { cx } from '../lib';

import type { Renderer } from '../types';
import type { Hit } from 'instantsearch.js';
import type { SendEventForHits } from 'instantsearch.js/es/lib/utils';

export type HitsProps<
  THit,
  TAdditionalProps extends React.ComponentProps<'div'>
> = {
  hits: THit[];
  // FIXME: define and export props type
  itemComponent: (props: any) => JSX.Element;
  sendEvent: SendEventForHits;
  classNames?: Partial<HitsClassNames>;
  // FIXME: define and export props type
  emptyComponent?: (props: any) => JSX.Element;
} & TAdditionalProps;

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
  return <
    THit extends Hit,
    TAdditionalProps extends React.ComponentProps<'div'>
  >({
    classNames = {},
    hits,
    itemComponent: ItemComponent,
    sendEvent,
    emptyComponent: EmptyComponent,
    ...props
  }: HitsProps<THit, TAdditionalProps>) => {
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
