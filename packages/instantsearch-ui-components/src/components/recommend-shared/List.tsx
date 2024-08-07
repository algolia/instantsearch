/** @jsx createElement */

import type {
  RecommendClassNames,
  RecommendTranslations,
  RecordWithObjectID,
  Renderer,
  RecommendLayoutProps,
} from '../../types';

export function createListComponent({ createElement }: Renderer) {
  return function List<TItem extends RecordWithObjectID>(
    userProps: RecommendLayoutProps<
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
