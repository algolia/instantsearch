/** @jsx createElement */

import { getHitsByObjectID } from '../../../lib/utils/chat';

import type { Hooks, RecordWithObjectID, Renderer } from '../../../types';
import type { ClientSideToolComponentProps } from '../types';

export type DisplayResultsTranslations = {
  /**
   * Caption shown under the groups while the tool is still streaming its
   * output. Defaults to "Curating results…".
   */
  streamingLabel: string;
};

type DisplayResultsGroup<THit> = {
  title?: string;
  why?: string;
  results?: Array<RecordWithObjectID<THit>>;
};

type DisplayResultsOutput<THit> = {
  intro?: string;
  groups?: Array<DisplayResultsGroup<THit>>;
};

/**
 * An item handed to a group's carousel: the record (hydrated from the search
 * tool) augmented with the display tool's own result object under a separate
 * `__displayToolResult` namespace, so the tool's curation fields (e.g. `why`)
 * can never collide with record fields in either direction.
 */
export type DisplayResultsItem<THit extends RecordWithObjectID> =
  RecordWithObjectID<THit> & {
    __displayToolResult: RecordWithObjectID<THit>;
  };

export type DisplayResultsGroupCarouselProps<THit extends RecordWithObjectID> =
  {
    items: Array<DisplayResultsItem<THit>>;
    sendEvent: ClientSideToolComponentProps['sendEvent'];
  };

export type DisplayResultsToolProps<THit extends RecordWithObjectID> = {
  toolProps: ClientSideToolComponentProps;
  /**
   * Renders a single group's carousel. The framework wrapper owns the
   * carousel implementation (and its internal hooks/refs) — ui-components
   * just lays out the intro, per-group headers, and the streaming caption.
   */
  groupCarouselComponent: (
    props: DisplayResultsGroupCarouselProps<THit>
  ) => JSX.Element;
  translations?: Partial<DisplayResultsTranslations>;
};

const DEFAULT_TRANSLATIONS: DisplayResultsTranslations = {
  streamingLabel: 'Curating results…',
};

export function createDisplayResultsToolComponent<
  TObject extends RecordWithObjectID
  // oxlint-disable-next-line no-unused-vars
>({
  createElement,
  Fragment,
  useEffect,
  useMemo,
  useRef,
}: Renderer & Pick<Hooks, 'useEffect' | 'useMemo' | 'useRef'>) {
  return function DisplayResultsTool(
    userProps: DisplayResultsToolProps<TObject>
  ) {
    const {
      toolProps,
      groupCarouselComponent: renderGroupCarousel,
      translations: userTranslations,
    } = userProps;
    const { message, messages, sendEvent } = toolProps;

    const translations: DisplayResultsTranslations = {
      ...DEFAULT_TRANSLATIONS,
      ...userTranslations,
    };

    const toolCallId = message?.toolCallId;
    const hitsByObjectID = useMemo(
      () => (messages ? getHitsByObjectID(messages, toolCallId) : undefined),
      [messages, toolCallId]
    );

    const output = message?.output as DisplayResultsOutput<TObject> | undefined;
    const intro = typeof output?.intro === 'string' ? output.intro : undefined;
    const groups = Array.isArray(output?.groups) ? output.groups : [];

    const displayedGroups = useMemo(
      () =>
        groups
          .map((group) => {
            const results = Array.isArray(group.results)
              ? group.results.filter(
                  (r): r is RecordWithObjectID<TObject> =>
                    Boolean(r) &&
                    typeof r.objectID === 'string' &&
                    r.objectID !== ''
                )
              : [];

            if (results.length === 0) {
              return null;
            }

            const items: Array<DisplayResultsItem<TObject>> = results.map(
              (result, idx) => {
                const hydrated = hitsByObjectID?.[result.objectID] as
                  | RecordWithObjectID<TObject>
                  | undefined;

                return {
                  ...(hydrated as RecordWithObjectID<TObject>),
                  objectID: result.objectID,
                  __position: idx + 1,
                  __displayToolResult: result,
                };
              }
            );

            return {
              group,
              items,
            };
          })
          .filter(
            (
              group
            ): group is {
              group: DisplayResultsGroup<TObject>;
              items: Array<DisplayResultsItem<TObject>>;
            } => group !== null
          ),
      [groups, hitsByObjectID]
    );

    const viewedItems = displayedGroups.flatMap(({ items }) => items);
    const viewedItemsSignature = viewedItems
      .map((item) => `${item.objectID}:${item.__position}`)
      .join('|');
    const lastViewedItemsSignatureRef = useRef<string | undefined>(undefined);

    useEffect(() => {
      if (
        viewedItems.length === 0 ||
        viewedItemsSignature === lastViewedItemsSignatureRef.current
      ) {
        return;
      }

      const timer = setTimeout(() => {
        lastViewedItemsSignatureRef.current = viewedItemsSignature;
        sendEvent('view:internal', viewedItems, 'items_shown');
      }, 0);

      return () => {
        clearTimeout(timer);
      };
    }, [sendEvent, viewedItems, viewedItemsSignature]);

    const isStreaming =
      message?.state === 'output-available' &&
      (message as { preliminary?: boolean }).preliminary === true;

    if (!intro && groups.length === 0) {
      return <Fragment />;
    }

    return (
      <div className="ais-ChatToolDisplayResults">
        {intro && (
          <div className="ais-ChatToolDisplayResults-intro">{intro}</div>
        )}

        {displayedGroups.map(({ group, items }, groupIndex) => {
          return (
            <div key={groupIndex} className="ais-ChatToolDisplayResults-group">
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
              {renderGroupCarousel({ items, sendEvent })}
            </div>
          );
        })}

        {isStreaming && (
          <div className="ais-ChatToolDisplayResults-streaming">
            {translations.streamingLabel}
          </div>
        )}
      </div>
    );
  };
}
