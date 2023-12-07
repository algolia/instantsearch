/** @jsx createElement */

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

type BaseHit = {
  objectID: string;
};

export type HitsProps<T extends BaseHit> = {
  hitComponent?: (props: {
    hit: T;
    item: T;
    sendEvent: (eventName: string, hit: T, event: string) => void;
  }) => JSX.Element;
  itemComponent?: (props: { hit: T; index: number }) => JSX.Element;
  hits: T[];
  className?: string;
  classNames?: Partial<HitsClassNames>;
  sendEvent: (eventName: string, hit: T, event: string) => void;
};

export function cx(
  ...classNames: Array<string | number | boolean | undefined | null>
) {
  return classNames.filter(Boolean).join(' ');
}

export function createHits({ createElement }: any) {
  function DefaultHitComponent({ hit }: { hit: BaseHit }) {
    return (
      <div style={{ wordBreak: 'break-all' }}>
        {JSON.stringify(hit).slice(0, 100)}…
      </div>
    );
  }

  return function Hits<T extends BaseHit>({
    hitComponent: HitComponent,
    itemComponent: ItemComponent,
    classNames = {},
    hits,
    sendEvent,
    ...props
  }: HitsProps<T>) {
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
          {hits.map((hit, index) =>
            ItemComponent ? (
              <ItemComponent hit={hit} index={index} />
            ) : (
              <li
                key={hit.objectID}
                className={cx('ais-Hits-item', classNames.item)}
                onClick={() => {
                  sendEvent('click:internal', hit, 'Hit Clicked');
                }}
                onAuxClick={() => {
                  sendEvent('click:internal', hit, 'Hit Clicked');
                }}
              >
                {HitComponent ? (
                  // Vue uses `item` and React uses `hit`
                  <HitComponent item={hit} hit={hit} sendEvent={sendEvent} />
                ) : (
                  <DefaultHitComponent hit={hit} />
                )}
              </li>
            )
          )}
        </ol>
      </div>
    );
  };
}
