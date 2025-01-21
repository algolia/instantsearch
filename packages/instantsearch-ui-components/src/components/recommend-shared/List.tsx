/** @jsx createElement */

import type {
  RecommendClassNames,
  RecordWithObjectID,
  Renderer,
  RecommendLayoutProps,
} from '../../types';

export function createListComponent({ createElement }: Renderer) {
  return function List<TItem extends RecordWithObjectID>(
    userProps: RecommendLayoutProps<TItem, Partial<RecommendClassNames>>
  ) {
    const {
      classNames = {},
      itemComponent: ItemComponent,
      items,
      sendEvent,
    } = userProps;

    return (
      <div className={classNames.container}>
        <ol className={classNames.list}>
          {items.map((item) => (
            <li
              key={item.objectID}
              className={classNames.item}
              onClick={() => {
                sendEvent('click:internal', item, 'Item Clicked');
              }}
              onAuxClick={() => {
                sendEvent('click:internal', item, 'Item Clicked');
              }}
            >
              <ItemComponent item={item} sendEvent={sendEvent} />
            </li>
          ))}
        </ol>
      </div>
    );
  };
}
