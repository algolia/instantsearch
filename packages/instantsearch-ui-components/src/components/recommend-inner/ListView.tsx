/** @jsx createElement */
import { cx } from '../../lib';

import type {
  ItemComponentProps,
  RecommendClassNames,
  RecommendTranslations,
  RecordWithObjectID,
  Renderer,
} from '../../types';

export type ViewProps<
  TItem extends RecordWithObjectID,
  TTranslations extends Record<string, string>,
  TClassNames extends Record<string, string>
> = {
  classNames: TClassNames;
  itemComponent: <
    TComponentProps extends Record<string, unknown> = Record<string, unknown>
  >(
    props: ItemComponentProps<RecordWithObjectID<TItem>> & TComponentProps
  ) => JSX.Element;
  items: TItem[];
  translations: TTranslations;
};

export function createListViewComponent({ createElement, Fragment }: Renderer) {
  return function ListView<TItem extends RecordWithObjectID>(
    userProps: ViewProps<
      TItem,
      RecommendTranslations,
      Partial<RecommendClassNames>
    >
  ) {
    const { classNames = {}, itemComponent: ItemComponent, items } = userProps;
    return (
      <div className={cx('ais-Recommend-container', classNames.container)}>
        <ol className={cx('ais-Recommend-list', classNames.list)}>
          {items.map((item) => (
            <li
              key={item.objectID}
              className={cx('ais-Recommend-item', classNames.item)}
            >
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
