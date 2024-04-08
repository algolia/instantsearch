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
            <li key={item.objectID} className={classNames.item}>
              <ItemComponent
                createElement={createElement}
                Fragment={Fragment}
                item={item}
              />
            </li>
          ))}
        </ol>
      </div>
    );
  };
}
