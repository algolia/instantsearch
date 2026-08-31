/** @jsx createElement */

import { getHitsByObjectID } from '../../../lib/utils/chat';

import {
  createGroundedComparisonTableComponent,
  defaultComparisonTableTranslations,
} from './createGroundedComparisonTable';

import type { Hooks, Renderer } from '../../../types';
import type { ClientSideToolComponentProps } from '../types';
import type { ComparisonTableTranslations } from './createGroundedComparisonTable';

/**
 * Builtin comparison tool (`algolia_compare_products`).
 *
 * The agent triggers this client-side tool when it detects a comparison
 * request. Its arguments name ONLY the products (by objectID) and the attribute
 * *keys* to compare — never the values. Every cell is hydrated from the real
 * `algolia_search_index` hits of the same turn via `getHitsByObjectID`, so the
 * model physically cannot type (and therefore cannot hallucinate) a price or
 * spec. This is the "grounded table" fix from the agentic-evals comparison
 * study, promoted from the display-block prototype to a first-class tool.
 *
 * Tool-call input it consumes:
 *
 *   {
 *     objectIDs: ['A', 'B'],                    // 2+ products, one row each
 *     attributes: ['price', 'rating'],          // attribute KEYS (also headers)
 *     columns?: ['Product', 'Price', 'Rating'], // optional display labels
 *     intro?: 'Both are great for...'           // optional one-line lead-in
 *   }
 *
 * Any other input field (e.g. smuggled attribute values) is ignored by
 * construction: the renderer never reads values off the input.
 */

export type CompareProductsToolInput = {
  objectIDs?: unknown;
  attributes?: unknown;
  columns?: unknown;
  intro?: unknown;
};

export type CompareProductsToolProps = {
  toolProps: ClientSideToolComponentProps;
  translations?: Partial<ComparisonTableTranslations>;
};

/** Keeps only non-empty string entries, dropping anything else the model sent. */
function stringList(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter(
    (entry): entry is string => typeof entry === 'string' && entry !== ''
  );
}

export function createCompareProductsToolComponent({
  createElement,
  Fragment,
  useMemo,
}: Renderer & Pick<Hooks, 'useMemo'>) {
  const GroundedComparisonTable = createGroundedComparisonTableComponent({
    createElement,
    Fragment,
  });

  return function CompareProductsTool(userProps: CompareProductsToolProps) {
    const { toolProps, translations: userTranslations } = userProps;
    const { message, messages } = toolProps;

    const translations: ComparisonTableTranslations = {
      ...defaultComparisonTableTranslations,
      ...userTranslations,
    };

    const toolCallId = message?.toolCallId;
    const hitsByObjectID = useMemo(
      () => (messages ? getHitsByObjectID(messages, toolCallId) : {}),
      [messages, toolCallId]
    );

    // Wait for the agent's arguments to be complete before rendering.
    if (
      !message ||
      (message.state !== 'input-available' &&
        message.state !== 'output-available')
    ) {
      return <Fragment />;
    }

    const input = (message.input ?? {}) as CompareProductsToolInput;
    const objectIDs = stringList(input.objectIDs);
    const attributes = stringList(input.attributes);
    const columns = Array.isArray(input.columns)
      ? stringList(input.columns)
      : undefined;
    const intro = typeof input.intro === 'string' ? input.intro : undefined;

    if (objectIDs.length === 0) {
      return <Fragment />;
    }

    return (
      <GroundedComparisonTable
        intro={intro}
        objectIDs={objectIDs}
        attributes={attributes}
        columns={columns}
        hitsByObjectID={hitsByObjectID}
        translations={translations}
      />
    );
  };
}
