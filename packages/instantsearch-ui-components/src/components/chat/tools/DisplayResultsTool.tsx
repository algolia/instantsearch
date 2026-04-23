/** @jsx createElement */

import { createCarouselComponent, generateCarouselId } from '../../Carousel';

import type { RecordWithObjectID, Renderer } from '../../../types';
import type { CarouselProps } from '../../Carousel';
import type { ClientSideToolComponentProps } from '../types';

type DisplayResultsGroup<THit> = {
  title?: string;
  why?: string;
  hits?: Array<RecordWithObjectID<THit>>;
  queryID?: string;
};

type DisplayResultsOutput<THit> = {
  intro?: string;
  groups?: Array<DisplayResultsGroup<THit>>;
};

export type DisplayResultsToolProps<THit extends RecordWithObjectID> = {
  useMemo: <TType>(factory: () => TType, inputs: readonly unknown[]) => TType;
  useRef: <TType>(initialValue: TType) => { current: TType };
  useState: <TType>(
    initialState: TType
  ) => [TType, (newState: TType) => unknown];
  toolProps: ClientSideToolComponentProps;
  itemComponent?: CarouselProps<THit>['itemComponent'];
};

type GroupCarouselProps<THit extends RecordWithObjectID> = Pick<
  DisplayResultsToolProps<THit>,
  'useRef' | 'useState' | 'itemComponent'
> & {
  items: Array<RecordWithObjectID<THit>>;
  sendEvent: ClientSideToolComponentProps['sendEvent'];
};

export function createDisplayResultsToolComponent<
  TObject extends RecordWithObjectID
>({ createElement, Fragment }: Renderer) {
  const Carousel = createCarouselComponent({ createElement, Fragment });

  function GroupCarousel({
    useRef,
    useState,
    items,
    itemComponent: ItemComponent,
    sendEvent,
  }: GroupCarouselProps<TObject>) {
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const carouselRefs: Pick<
      CarouselProps<TObject>,
      | 'listRef'
      | 'nextButtonRef'
      | 'previousButtonRef'
      | 'carouselIdRef'
      | 'canScrollLeft'
      | 'canScrollRight'
      | 'setCanScrollLeft'
      | 'setCanScrollRight'
    > = {
      listRef: useRef(null),
      nextButtonRef: useRef(null),
      previousButtonRef: useRef(null),
      carouselIdRef: useRef(generateCarouselId()),
      canScrollLeft,
      canScrollRight,
      setCanScrollLeft,
      setCanScrollRight,
    };

    return (
      <Carousel
        {...carouselRefs}
        items={items}
        itemComponent={ItemComponent}
        showNavigation={false}
        sendEvent={sendEvent}
      />
    );
  }

  return function DisplayResultsTool(
    userProps: DisplayResultsToolProps<TObject>
  ) {
    const { useRef, useState, itemComponent, toolProps } = userProps;
    const { message, sendEvent } = toolProps;

    const output = message?.output as
      | DisplayResultsOutput<TObject>
      | undefined;
    const groups = output?.groups ?? [];

    if (!output?.intro && groups.length === 0) {
      return <Fragment />;
    }

    return (
      <div className="ais-ChatToolDisplayResults">
        {output?.intro && (
          <div className="ais-ChatToolDisplayResults-intro">{output.intro}</div>
        )}

        {groups.map((group, groupIndex) => {
          const hits = group.hits ?? [];
          if (hits.length === 0) return null;

          const items = hits.map((hit, idx) => ({
            ...hit,
            __position: idx + 1,
            ...(group.queryID ? { __queryID: group.queryID } : {}),
          }));

          return (
            <div
              key={groupIndex}
              className="ais-ChatToolDisplayResults-group"
            >
              {group.title && (
                <div className="ais-ChatToolDisplayResults-groupTitle">
                  {group.title}
                </div>
              )}
              {group.why && (
                <div className="ais-ChatToolDisplayResults-groupWhy">
                  {group.why}
                </div>
              )}
              <GroupCarousel
                useRef={useRef}
                useState={useState}
                items={items}
                itemComponent={itemComponent}
                sendEvent={sendEvent}
              />
            </div>
          );
        })}
      </div>
    );
  };
}
