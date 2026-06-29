/** @jsx createElement */

import { getHitsByObjectID } from '../../../lib/chat';

import type { Hooks, RecordWithObjectID, Renderer } from '../../../types';
import type { ClientSideToolComponentProps } from 'instantsearch-core';

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

    const output = message?.output as DisplayResultsOutput<TObject> | undefined;
    const intro = typeof output?.intro === 'string' ? output.intro : undefined;
    const groups = Array.isArray(output?.groups) ? output.groups : [];

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

        {groups.map((group, groupIndex) => {
          const results = Array.isArray(group.results)
            ? group.results.filter(
                (r): r is RecordWithObjectID<TObject> =>
                  Boolean(r) &&
                  typeof r.objectID === 'string' &&
                  r.objectID !== ''
              )
            : [];

          if (results.length === 0) return null;

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
