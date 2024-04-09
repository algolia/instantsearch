/** @jsx createElement */

import type {
  RecommendClassNames,
  RecommendTranslations,
  RecordWithObjectID,
  Renderer,
  RecommendViewProps,
} from '../../types';

export function createListViewComponent({ createElement, Fragment }: Renderer) {
  return function ListView<TItem extends RecordWithObjectID>(
    userProps: RecommendViewProps<
      TItem,
      RecommendTranslations,
      Partial<RecommendClassNames>
    >
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
            <ItemComponent
              key={item.objectID}
              className={classNames.item}
              createElement={createElement}
              Fragment={Fragment}
              item={item}
              onClick={() => {
                sendEvent('click:internal', item, 'Hit Clicked');
              }}
              onAuxClick={() => {
                sendEvent('click:internal', item, 'Hit Clicked');
              }}
            />
          ))}
        </ol>
      </div>
    );
  };
}
