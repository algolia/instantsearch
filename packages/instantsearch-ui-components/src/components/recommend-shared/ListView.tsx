/** @jsx createElement */

import type {
  RecommendClassNames,
  RecommendTranslations,
  RecordWithObjectID,
  Renderer,
  RecommendViewProps,
} from '../../types';

export function createListViewComponent({ createElement }: Renderer) {
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
            <li
              key={item.objectID}
              className={classNames.item}
              onClick={sendEvent}
              onAuxClick={sendEvent}
            >
              <ItemComponent item={item} />
            </li>
          ))}
        </ol>
      </div>
    );
  };
}
