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

type JsonFrame = { key: string; lastKey: string; isObject: boolean };

/**
 * Decodes a raw property-key body with JSON string semantics, so an escaped
 * spelling of `objectID` compares equal to the name `JSON.parse` produces.
 * An undecodable key is kept verbatim: it matches no name below, and the
 * document holding it cannot parse either.
 */
const decodeJsonKey = (rawKey: string) => {
  if (rawKey.indexOf('\\') === -1) {
    return rawKey;
  }
  try {
    return JSON.parse(`"${rawKey}"`) as string;
  } catch {
    return rawKey;
  }
};

/**
 * Reports whether the raw input ends inside an unterminated
 * `groups[].results[].objectID` value.
 *
 * Partial input is parsed with repair that closes an open string literal, so an
 * identifier still mid-delta reaches `input` looking complete and can hydrate a
 * different record whose identifier is a prefix of the real one.
 */
const endsInsideResultObjectId = (rawInput: string) => {
  const frames: JsonFrame[] = [];
  let inString = false;
  let isEscaped = false;
  let isKey = false;
  let expectValue = false;
  let stringStart = 0;

  for (let index = 0; index < rawInput.length; index++) {
    const char = rawInput[index];

    if (inString) {
      if (isEscaped) {
        isEscaped = false;
      } else if (char === '\\') {
        isEscaped = true;
      } else if (char === '"') {
        inString = false;
        if (isKey) {
          frames[frames.length - 1].lastKey = decodeJsonKey(
            rawInput.slice(stringStart, index)
          );
        } else {
          expectValue = false;
        }
      }
      continue;
    }

    if (char === '"') {
      inString = true;
      stringStart = index + 1;
      isKey = !expectValue && frames[frames.length - 1]?.isObject === true;
    } else if (char === ':') {
      expectValue = true;
    } else if (char === ',') {
      expectValue = false;
    } else if (char === '{' || char === '[') {
      frames.push({
        key: expectValue ? (frames[frames.length - 1]?.lastKey ?? '') : '',
        lastKey: '',
        isObject: char === '{',
      });
      expectValue = false;
    } else if (char === '}' || char === ']') {
      frames.pop();
      expectValue = false;
    }
  }

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
  TObject extends RecordWithObjectID,
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
    const { message, messages, sendEvent, status } = toolProps;

    const translations: DisplayResultsTranslations = {
      ...DEFAULT_TRANSLATIONS,
      ...userTranslations,
    };

    const hitsByObjectID = useMemo(
      () => (messages ? getHitsByObjectID(messages, message) : undefined),
      [messages, message]
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
        items: Array<DisplayResultsItem<TObject>>;
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

      const items = results.reduce<Array<DisplayResultsItem<TObject>>>(
        (renderedItems, result) => {
          if (!hitsByObjectID || !hasOwn(hitsByObjectID, result.objectID)) {
            return renderedItems;
          }

          const hydrated = hitsByObjectID[
            result.objectID
          ] as RecordWithObjectID<TObject>;

          renderedItems.push({
            ...hydrated,
            objectID: result.objectID,
            __position: renderedItems.length + 1,
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
