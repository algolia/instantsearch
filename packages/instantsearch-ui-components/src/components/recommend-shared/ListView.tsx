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
    const { classNames = {}, itemComponent: ItemComponent, items } = userProps;

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
            />
          ))}
        </ol>
      </div>
    );
  };
}
