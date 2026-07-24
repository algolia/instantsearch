/** @jsx createElement */

import { getHitsByObjectID } from '../../../lib/utils/chat';

import type { Hooks, RecordWithObjectID, Renderer } from '../../../types';
import type { ClientSideToolComponentProps } from '../types';

export type DisplayResultsTranslations = {
  /**
   * Caption shown under the groups while the tool is still streaming its
   * input. Defaults to "Curating results…".
   */
  streamingLabel: string;
};

type DisplayResultsGroup<THit> = {
  title?: string;
  why?: string;
  results?: Array<RecordWithObjectID<THit>>;
};

type DisplayResultsPayload<THit> = {
  intro?: string;
  groups?: Array<DisplayResultsGroup<THit>>;
};

const isObject = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object';

const hasOwn = (value: Record<string, unknown>, key: string) =>
  Object.prototype.hasOwnProperty.call(value, key);

const claimsDisplayResultsPayload = (
  value: unknown
): value is Record<string, unknown> =>
  isObject(value) && (hasOwn(value, 'intro') || hasOwn(value, 'groups'));

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
    items: Array<RecordWithObjectID<THit>>;
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
>({ createElement, Fragment, useMemo }: Renderer & Pick<Hooks, 'useMemo'>) {
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

    const inputClaimsPayload = claimsDisplayResultsPayload(message?.input);
    const legacyOutput =
      message?.state === 'output-available' &&
      (message as { preliminary?: boolean }).preliminary !== true &&
      !inputClaimsPayload
        ? message.output
        : undefined;
    const payload = (
      inputClaimsPayload
        ? message?.input
        : claimsDisplayResultsPayload(legacyOutput)
        ? legacyOutput
        : undefined
    ) as DisplayResultsPayload<TObject> | undefined;
    const intro =
      typeof payload?.intro === 'string' ? payload.intro : undefined;
    const groups = Array.isArray(payload?.groups)
      ? payload.groups.filter(isObject)
      : [];
    const isStreaming = message?.state === 'input-streaming';

    const renderableGroups = groups.reduce<
      Array<{
        key: number;
        title?: string;
        why?: string;
        items: Array<DisplayResultsItem<TObject>>;
      }>
    >((renderedGroups, group, groupIndex) => {
      const results = Array.isArray(group.results)
        ? group.results.filter(
            (result): result is RecordWithObjectID<TObject> =>
              isObject(result) &&
              typeof result.objectID === 'string' &&
              result.objectID !== ''
          )
        : [];

      const items = results.reduce<Array<DisplayResultsItem<TObject>>>(
        (renderedItems, result, resultIndex) => {
          if (!hitsByObjectID || !hasOwn(hitsByObjectID, result.objectID)) {
            return renderedItems;
          }

          const hydrated = hitsByObjectID[
            result.objectID
          ] as RecordWithObjectID<TObject>;

          renderedItems.push({
            ...hydrated,
            objectID: result.objectID,
            __position: resultIndex + 1,
            __displayToolResult: result,
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

    if (!intro && renderableGroups.length === 0 && !isStreaming) {
      return <Fragment />;
    }

    return (
      <div className="ais-ChatToolDisplayResults">
        {intro && (
          <div className="ais-ChatToolDisplayResults-intro">{intro}</div>
        )}

        {renderableGroups.map((group) => (
          <div key={group.key} className="ais-ChatToolDisplayResults-group">
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
            {renderGroupCarousel({ items: group.items, sendEvent })}
          </div>
        ))}

        {isStreaming && (
          <div className="ais-ChatToolDisplayResults-streaming">
            {translations.streamingLabel}
          </div>
        )}
      </div>
    );
  };
}
