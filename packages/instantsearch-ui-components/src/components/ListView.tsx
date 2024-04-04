/** @jsx createElement */
import { cx } from '../lib';

import type { Renderer } from '../types';
import type {
  ItemComponentProps,
  RecommendClassNames,
  RecommendTranslations,
  RecordWithObjectID,
} from './types';

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
    userProps: ViewProps<TItem, RecommendTranslations, RecommendClassNames>
  ) {
    const { classNames = {}, itemComponent: ItemComponent, items } = userProps;
    return (
      <div className={cx('auc-Recommend-container', classNames.container)}>
        <ol className={cx('auc-Recommend-list', classNames.list)}>
          {items.map((item) => (
            <li
              key={item.objectID}
              className={cx('auc-Recommend-item', classNames.item)}
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
