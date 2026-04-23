/** @jsx createElement */

import type { RecordWithObjectID, Renderer } from '../../../types';
import type { ChatMessageBase, ClientSideToolComponentProps } from '../types';

export type DisplayResultsItemComponentProps<THit> = {
  item: THit;
  why?: string;
};

export type DisplayResultsGroupHeaderProps = {
  title?: string;
  why?: string;
  hitsPerPage: number;
};

export type DisplayResultsTranslations = {
  /**
   * Caption shown under the groups while the tool is still streaming its
   * output. Defaults to "Curating results…".
   */
  streamingLabel: string;
};

/**
 * Shape the tool expects `normalizeOutput` to return. Intentionally
 * structural so ui-components does not need to reference lib-defined types.
 */
export type DisplayResultsViewModel = {
  intro?: string;
  groups: Array<{
    title?: string;
    why?: string;
    results: Array<{ objectID: string; why?: string }>;
  }>;
};

export type DisplayResultsToolProps<THit extends RecordWithObjectID> = {
  useMemo: <TType>(factory: () => TType, inputs: readonly unknown[]) => TType;
  toolProps: ClientSideToolComponentProps;
  /**
   * Turns the tool's raw `output` (whatever the lib has assembled so far —
   * partial during streaming, final on `output-available`) into the shape
   * this component renders. The lib ships a canonical implementation at
   * `instantsearch.js/es/lib/chat#normalizeDisplayResultsOutput` — the UI
   * takes it as a prop so ui-components stays dependency-free.
   */
  normalizeOutput: (raw: unknown) => DisplayResultsViewModel;
  /**
   * Resolves each `objectID` referenced by the display tool to the full hit
   * record that was previously surfaced by a search tool call in the same
   * conversation. The lib ships a canonical implementation at
   * `instantsearch.js/es/lib/chat#buildConversationHits`.
   */
  buildConversationHits: (
    messages: ChatMessageBase[] | undefined
  ) => Map<string, THit>;
  /**
   * Renders each result inside a group. Receives the full hit record resolved
   * by `buildConversationHits`.
   */
  itemComponent?: (
    props: DisplayResultsItemComponentProps<THit>
  ) => JSX.Element;
  /**
   * Optional custom header for each group. Defaults to a simple title row.
   */
  groupHeaderComponent?: (
    props: DisplayResultsGroupHeaderProps
  ) => JSX.Element | null;
  translations?: Partial<DisplayResultsTranslations>;
};

const DEFAULT_TRANSLATIONS: DisplayResultsTranslations = {
  streamingLabel: 'Curating results…',
};

export function createDisplayResultsToolComponent<
  THit extends RecordWithObjectID
>({ createElement, Fragment }: Renderer) {
  return function DisplayResultsTool(userProps: DisplayResultsToolProps<THit>) {
    const {
      useMemo,
      toolProps,
      normalizeOutput,
      buildConversationHits,
      itemComponent: ItemComponent,
      groupHeaderComponent: GroupHeaderComponent,
      translations: userTranslations,
    } = userProps;
    const { message, messages } = toolProps;

    const translations: DisplayResultsTranslations = {
      ...DEFAULT_TRANSLATIONS,
      ...userTranslations,
    };

    const conversationHits = useMemo(
      () => buildConversationHits(messages),
      [buildConversationHits, messages]
    );

    const parsed = useMemo(() => {
      if (!message || message.state !== 'output-available') {
        return normalizeOutput(null);
      }
      return normalizeOutput((message as { output?: unknown }).output);
    }, [normalizeOutput, message]);

    const isStreaming =
      message?.state === 'output-available' &&
      (message as { preliminary?: boolean }).preliminary === true;

    if (!parsed.groups.length && !parsed.intro) {
      return null;
    }

    return (
      <div className="ais-ChatToolDisplayResults">
        {parsed.intro && (
          <div className="ais-ChatToolDisplayResults-intro">{parsed.intro}</div>
        )}

        {parsed.groups.map((group, groupIndex) => {
          const items = group.results
            .map((result) => {
              const hit = conversationHits.get(result.objectID);
              return hit ? { hit, why: result.why } : null;
            })
            .filter(
              (entry): entry is { hit: THit; why: string | undefined } =>
                entry !== null
            );

          if (items.length === 0) return null;

          const headerProps: DisplayResultsGroupHeaderProps = {
            title: group.title,
            why: group.why,
            hitsPerPage: items.length,
          };

          return (
            <div key={groupIndex} className="ais-ChatToolDisplayResults-group">
              {GroupHeaderComponent ? (
                <GroupHeaderComponent {...headerProps} />
              ) : (
                group.title && (
                  <div className="ais-ChatToolDisplayResults-groupTitle">
                    {group.title}
                  </div>
                )
              )}

              <div className="ais-ChatToolDisplayResults-items">
                {items.map(({ hit, why }) =>
                  ItemComponent ? (
                    <div
                      key={String(hit.objectID)}
                      className="ais-ChatToolDisplayResults-item"
                    >
                      <ItemComponent item={hit} why={why} />
                    </div>
                  ) : (
                    <div
                      key={String(hit.objectID)}
                      className="ais-ChatToolDisplayResults-item"
                    >
                      {String(hit.objectID)}
                    </div>
                  )
                )}
              </div>
            </div>
          );
        })}

        {isStreaming && (
          <div className="ais-ChatToolDisplayResults-streaming">
            {translations.streamingLabel}
          </div>
        )}

        <Fragment />
      </div>
    );
  };
}
