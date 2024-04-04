/** @jsx createElement */

import { cx } from '../lib';

import { createDefaultHeaderComponent } from './recommend-inner/DefaultHeader';
import { createListViewComponent } from './recommend-inner/ListView';

import type {
  ItemComponentProps,
  RecommendClassNames,
  RecommendStatus,
  RecommendTranslations,
  RecordWithObjectID,
  Renderer,
} from '../types';
import type { ViewProps } from './recommend-inner/ListView';

// types

export type FrequentlyBoughtTogetherComponentProps<TObject> = {
  classNames: Partial<RecommendClassNames>;
  recommendations: TObject[];
  translations: Partial<RecommendTranslations>;
};

export type HeaderComponentProps<TObject> =
  FrequentlyBoughtTogetherComponentProps<TObject>;

export type ChildrenProps<TObject> =
  FrequentlyBoughtTogetherComponentProps<TObject> & {
    Fallback: () => JSX.Element | null;
    Header: (props: HeaderComponentProps<TObject>) => JSX.Element | null;
    status: RecommendStatus;
    View: (props: unknown) => JSX.Element;
  };

// most above will need to go to shared file

export type RecommendComponentProps<
  TObject,
  TComponentProps extends Record<string, unknown> = Record<string, unknown>
> = {
  itemComponent: (
    props: ItemComponentProps<RecordWithObjectID<TObject>> & TComponentProps
  ) => JSX.Element;
  items: Array<RecordWithObjectID<TObject>>;
  classNames?: Partial<RecommendClassNames>;
  fallbackComponent?: (props: TComponentProps) => JSX.Element;
  headerComponent?: (
    props: HeaderComponentProps<TObject> & TComponentProps
  ) => JSX.Element;
  status: RecommendStatus;
  translations?: Partial<RecommendTranslations>;
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
  TComponentProps extends Record<string, unknown> = Record<string, unknown>
> = RecommendComponentProps<TObject, TComponentProps>;

export function createFrequentlyBoughtTogetherComponent({
  createElement,
  Fragment,
}: Renderer) {
  return function FrequentlyBoughtTogether<TObject>(
    userProps: FrequentlyBoughtTogetherProps<TObject>
  ) {
    const { classNames = {}, ...props } = userProps;

    const translations: Required<RecommendTranslations> = {
      title: 'Frequently bought together',
      sliderLabel: 'Frequently bought together products',
      ...props.translations,
    };

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
      <section className={cx('ais-Recommend', classNames.root)}>
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
