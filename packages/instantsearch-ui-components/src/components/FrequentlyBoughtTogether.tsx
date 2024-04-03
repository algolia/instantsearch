/* eslint-disable @typescript-eslint/ban-types */
/** @jsx createElement */

import { cx } from '../lib';

import type { Renderer } from '../types';

// types
export type RecommendClassNames = Partial<{
  root: string;
  title: string;
  container: string;
  list: string;
  item: string;
}>;

export type InnerComponentProps<TObject> = {
  classNames: RecommendClassNames;
  recommendations: TObject[];
  translations: RecommendTranslations;
};

export type RecordWithObjectID<TObject = {}> = TObject & {
  objectID: string;
};
export type ItemComponentProps<TObject> = {
  item: TObject;
};

export type RecommendTranslations = Partial<{
  title: string;
  // Horizontal Slider
  sliderLabel: string;
}>;
export type RecommendStatus = 'loading' | 'stalled' | 'idle';

export type FrequentlyBoughtTogetherComponentProps<TObject> = {
  classNames: RecommendClassNames;
  recommendations: TObject[];
  translations: RecommendTranslations;
};

export type HeaderComponentProps<TObject> =
  FrequentlyBoughtTogetherComponentProps<TObject>;

export type ChildrenProps<TObject> =
  FrequentlyBoughtTogetherComponentProps<TObject> & {
    Fallback: () => JSX.Element | null;
    Header: (props: HeaderComponentProps<TObject>) => JSX.Element | null;
    status: RecommendStatus; // align with instantsearch status
    View: (props: unknown) => JSX.Element;
  };

export type ViewProps<
  TItem extends RecordWithObjectID,
  TTranslations extends Record<string, string>,
  TClassNames extends Record<string, string>
> = {
  classNames: TClassNames;
  itemComponent: <TComponentProps extends Record<string, unknown> = {}>(
    props: ItemComponentProps<RecordWithObjectID<TItem>> & TComponentProps
  ) => JSX.Element;
  items: TItem[];
  translations: TTranslations;
};

// components
export function createDefaultHeaderComponent({ createElement }: Renderer) {
  return function DefaultHeader<TObject>(props: InnerComponentProps<TObject>) {
    if (!props.recommendations || props.recommendations.length < 1) {
      return null;
    }

    if (!props.translations.title) {
      return null;
    }

    return (
      <h3 className={cx('auc-Recommend-title', props.classNames.title)}>
        {props.translations.title}
      </h3>
    );
  };
}

export function createListViewComponent({ createElement, Fragment }: Renderer) {
  return function ListView<TItem extends RecordWithObjectID>(
    props: ViewProps<TItem, RecommendTranslations, RecommendClassNames>
  ) {
    return (
      <div
        className={cx('auc-Recommend-container', props.classNames.container)}
      >
        <ol className={cx('auc-Recommend-list', props.classNames.list)}>
          {props.items.map((item) => (
            <li
              key={item.objectID}
              className={cx('auc-Recommend-item', props.classNames.item)}
            >
              <props.itemComponent
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

// most above will need to go to shared file

export type RecommendComponentProps<
  TObject,
  TComponentProps extends Record<string, unknown> = {}
> = {
  itemComponent: (
    props: ItemComponentProps<RecordWithObjectID<TObject>> & TComponentProps
  ) => JSX.Element;
  items: Array<RecordWithObjectID<TObject>>;
  classNames?: RecommendClassNames;
  // children?: (props: ChildrenProps<TObject> & TComponentProps) => JSX.Element;
  fallbackComponent?: (props: TComponentProps) => JSX.Element;
  headerComponent?: (
    props: HeaderComponentProps<TObject> & TComponentProps
  ) => JSX.Element;
  status: RecommendStatus;
  translations?: RecommendTranslations;
  view?: (
    props: ViewProps<
      RecordWithObjectID<TObject>,
      Required<RecommendTranslations>,
      Record<string, string>
    > &
      TComponentProps
  ) => JSX.Element;
};

export type FrequentlyBoughtTogetherProps<
  TObject,
  TComponentProps extends Record<string, unknown> = {}
> = RecommendComponentProps<TObject, TComponentProps>;

export function createFrequentlyBoughtTogether({
  createElement,
  Fragment,
}: Renderer) {
  return function FrequentlyBoughtTogether<TObject>(
    props: FrequentlyBoughtTogetherProps<TObject>
  ) {
    const translations: Required<RecommendTranslations> = {
      title: 'Frequently bought together',
      sliderLabel: 'Frequently bought together products',
      ...props.translations,
    };
    const classNames = props.classNames ?? {};

    const FallbackComponent = props.fallbackComponent ?? (() => null);

    const Header =
      props.headerComponent ??
      createDefaultHeaderComponent({ createElement, Fragment });
    const View =
      props.view ?? createListViewComponent({ createElement, Fragment });

    if (props.items.length === 0 && props.status === 'idle') {
      return <FallbackComponent />;
    }

    return (
      <section className={cx('auc-Recommend', classNames.root)}>
        <Header
          classNames={classNames}
          recommendations={props.items}
          translations={translations}
        />

        <View
          classNames={classNames}
          translations={translations}
          itemComponent={props.itemComponent}
          items={props.items}
        />
      </section>
    );
  };
}
