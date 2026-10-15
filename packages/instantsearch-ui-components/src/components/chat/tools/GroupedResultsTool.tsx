/** @jsx createElement */

import { getJsonCursor } from '../../../lib/utils/jsonCursor';

import type { Hooks, RecordWithObjectID, Renderer } from '../../../types';
import type { ClientSideToolComponentProps } from '../types';

export type GroupedResultsTranslations = {
  /**
   * Caption shown under the groups while the tool is still streaming its
   * input. Defaults to "Curating results…".
   */
  streamingLabel: string;
};

type GroupedResultsGroup<THit> = {
  title?: string;
  why?: string;
  results?: Array<RecordWithObjectID<THit>>;
};

type GroupedResultsPayload<THit> = {
  intro?: string;
  groups?: Array<GroupedResultsGroup<THit>>;
};

const isObject = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object';

const hasOwn = (value: Record<string, unknown>, key: string) =>
  Object.prototype.hasOwnProperty.call(value, key);

const claimsGroupedResultsPayload = (
  value: unknown
): value is Record<string, unknown> =>
  isObject(value) && (hasOwn(value, 'intro') || hasOwn(value, 'groups'));

/**
 * Reports whether the raw input ends inside an unterminated
 * `groups[].results[].objectID` value.
 *
 * Partial input is parsed with repair that closes an open string literal, so an
 * identifier still mid-delta reaches `input` looking complete and can hydrate a
 * different record whose identifier is a prefix of the real one.
 */
const endsInsideResultObjectId = (rawInput: string) => {
  const { frames, inString, isKey } = getJsonCursor(rawInput);

  return (
    inString &&
    !isKey &&
    frames[frames.length - 1]?.lastKey === 'objectID' &&
    frames[frames.length - 2]?.key === 'results' &&
    frames[frames.length - 4]?.key === 'groups'
  );
};

/**
 * An item handed to a group's carousel: the record (hydrated from the search
 * tool) augmented with the display tool's own result object under a separate
 * `__groupedToolResult` namespace, so the tool's curation fields (e.g. `why`)
 * can never collide with record fields in either direction.
 */
export type GroupedResultsItem<THit extends RecordWithObjectID> =
  RecordWithObjectID<THit> & {
    __groupedToolResult: RecordWithObjectID<THit>;
  };

export type GroupedResultsGroupCarouselProps<THit extends RecordWithObjectID> =
  {
    items: Array<GroupedResultsItem<THit>>;
    sendEvent: ClientSideToolComponentProps['context']['sendEvent'];
  };

export type GroupedResultsToolProps<THit extends RecordWithObjectID> = {
  toolProps: ClientSideToolComponentProps;
  /**
   * Renders a single group's carousel. The framework wrapper owns the
   * carousel implementation (and its internal hooks/refs) — ui-components
   * just lays out the intro, per-group headers, and the streaming caption.
   */
  groupCarouselComponent: (
    props: GroupedResultsGroupCarouselProps<THit>
  ) => JSX.Element;
  translations?: Partial<GroupedResultsTranslations>;
};

const DEFAULT_TRANSLATIONS: GroupedResultsTranslations = {
  streamingLabel: 'Curating results…',
};

export function createGroupedResultsToolComponent<
  TObject extends RecordWithObjectID,
  // oxlint-disable-next-line no-unused-vars
>({
  createElement,
  Fragment,
  useEffect,
  useRef,
}: Renderer & Pick<Hooks, 'useEffect' | 'useRef'>) {
  return function GroupedResultsTool(
    userProps: GroupedResultsToolProps<TObject>
  ) {
    const {
      toolProps,
      groupCarouselComponent: renderGroupCarousel,
      translations: userTranslations,
    } = userProps;
    const { context } = toolProps;
    const {
      message,
      insightsEventContext,
      sendEvent,
      messages,
      status,
      records,
    } = context;
    const instantSearchStatus =
      insightsEventContext?.instantSearchStatus ?? 'idle';

    const translations: GroupedResultsTranslations = {
      ...DEFAULT_TRANSLATIONS,
      ...userTranslations,
    };

    const inputClaimsPayload = claimsGroupedResultsPayload(message?.input);
    const legacyOutput =
      message?.state === 'output-available' &&
      (message as { preliminary?: boolean }).preliminary !== true &&
      !inputClaimsPayload
        ? message.output
        : undefined;
    const payload = (
      inputClaimsPayload
        ? message?.input
        : claimsGroupedResultsPayload(legacyOutput)
          ? legacyOutput
          : undefined
    ) as GroupedResultsPayload<TObject> | undefined;
    const intro =
      typeof payload?.intro === 'string' ? payload.intro : undefined;
    const groups = Array.isArray(payload?.groups)
      ? payload.groups.filter(isObject)
      : [];
    const latestMessage = messages?.[messages.length - 1];
    const isStreaming =
      status === 'streaming' &&
      message?.state === 'input-streaming' &&
      latestMessage?.parts.some((part) => part === message) === true;

    // Only the last result of the last group can still be mid-delta, so it is
    // the only one ever withheld.
    const rawInput =
      message?.state === 'input-streaming' ? message.rawInput : undefined;
    const withholdsTrailingResult =
      typeof rawInput === 'string' && endsInsideResultObjectId(rawInput);
    const lastGroupIndex = groups.length - 1;

    const renderableGroups = groups.reduce<
      Array<{
        key: number;
        title?: string;
        why?: string;
        items: Array<GroupedResultsItem<TObject>>;
      }>
    >((renderedGroups, group, groupIndex) => {
      const suppliedResults = Array.isArray(group.results)
        ? withholdsTrailingResult && groupIndex === lastGroupIndex
          ? group.results.slice(0, -1)
          : group.results
        : [];
      const results = suppliedResults.filter(
        (result): result is RecordWithObjectID<TObject> =>
          isObject(result) &&
          typeof result.objectID === 'string' &&
          result.objectID !== ''
      );

      const items = results.reduce<Array<GroupedResultsItem<TObject>>>(
        (renderedItems, result) => {
          // The backend sends this tool object IDs only.
          const hydrated = records?.get(result.objectID) as
            | RecordWithObjectID<TObject>
            | undefined;

          if (!hydrated) {
            return renderedItems;
          }

          renderedItems.push({
            ...hydrated,
            objectID: result.objectID,
            __position: renderedItems.length + 1,
            __groupedToolResult: result,
          });
          return renderedItems;
        },
        []
      );

      if (items.length === 0) {
        return renderedGroups;
      }

      renderedGroups.push({
        key: groupIndex,
        title: typeof group.title === 'string' ? group.title : undefined,
        why: typeof group.why === 'string' ? group.why : undefined,
        items,
      });
      return renderedGroups;
    }, []);

    const viewedItems = renderableGroups.flatMap((group) => group.items);
    const viewedItemsSignature = viewedItems
      .map((item) => `${item.objectID}:${item.__position}`)
      .join('|');
    const lastViewedItemsSignatureRef = useRef<string | undefined>(undefined);

    useEffect(() => {
      if (
        instantSearchStatus !== 'idle' ||
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
    }, [instantSearchStatus, sendEvent, viewedItems, viewedItemsSignature]);

    if (!intro && renderableGroups.length === 0 && !isStreaming) {
      return <Fragment />;
    }

    return (
      <div className="ais-ChatToolGroupedResults">
        {intro && (
          <div className="ais-ChatToolGroupedResults-intro">{intro}</div>
        )}

        {renderableGroups.map((group) => (
          <div key={group.key} className="ais-ChatToolGroupedResults-group">
            {group.title && (
              <div className="ais-ChatToolGroupedResults-groupTitle">
                {group.title}
              </div>
            )}
            {group.why && (
              <div className="ais-ChatToolGroupedResults-groupWhy">
                {group.why}
              </div>
            )}
            {renderGroupCarousel({ items: group.items, sendEvent })}
          </div>
        ))}

        {isStreaming && (
          <div className="ais-ChatToolGroupedResults-streaming">
            {translations.streamingLabel}
          </div>
        )}
      </div>
    );
  };
}
