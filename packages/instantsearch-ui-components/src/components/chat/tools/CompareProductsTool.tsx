/** @jsx createElement */

import {
  endsInsideRootProperty,
  getJsonCursor,
} from '../../../lib/utils/jsonCursor';

import {
  createGroundedComparisonTableComponent,
  criteriaFromAttributes,
  defaultComparisonTableTranslations,
} from './createGroundedComparisonTable';

import type { RecordWithObjectID, Renderer } from '../../../types';
import type { ClientSideToolComponentProps } from '../types';
import type {
  ComparisonCriterion,
  ComparisonTableTranslations,
  GroundedComparisonTableProps,
} from './createGroundedComparisonTable';

/**
 * Builtin comparison tool (`algolia_compare_products`).
 *
 * The agent calls this client-side tool to lay out a comparison as a table:
 * the compared products across the top (hydrated from the chat records store,
 * `context.records`, so the header never shows a product that isn't in the
 * catalog) and model-authored criteria down the side. Each criterion carries
 * one value per product; the agent fills them from the records it has (an
 * attribute, a detail from the description, a derived verdict), so the table
 * can say everything a Markdown table could — with a proper layout.
 *
 * Tool-call input it consumes:
 *
 *   {
 *     objectIDs: ['A', 'B'],                   // 2+ products, one column each
 *     criteria: [                              // one row each, values aligned
 *       { label: 'Price', values: ['$199', '$299'] },
 *       { label: 'Battery', values: ['4000 mAh', null] },   // null → "—"
 *     ],
 *     intro?: 'Both are great for...'          // optional one-line lead-in
 *   }
 *
 * The attribute-based shape (`attributes: ['price']`, values read off the
 * records) is still accepted for agents configured with the previous tool
 * definition.
 *
 * Registered with `streamInput`, the table renders while the arguments
 * stream: the product columns appear as soon as `objectIDs` is complete and
 * each criterion row follows once the agent has finished writing it.
 */

export type CompareProductsToolInput = {
  objectIDs?: unknown;
  criteria?: unknown;
  attributes?: unknown;
  columns?: unknown;
  intro?: unknown;
};

export type CompareProductsToolProps<
  THit extends RecordWithObjectID = RecordWithObjectID,
> = {
  toolProps: ClientSideToolComponentProps;
  itemComponent?: GroundedComparisonTableProps<THit>['itemComponent'];
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

/** Keeps only well-formed `{ label, values[] }` rows. */
function criteriaList(value: unknown): ComparisonCriterion[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.flatMap((entry): ComparisonCriterion[] => {
    if (
      !entry ||
      typeof entry !== 'object' ||
      typeof (entry as ComparisonCriterion).label !== 'string' ||
      (entry as ComparisonCriterion).label === ''
    ) {
      return [];
    }
    const values = (entry as ComparisonCriterion).values;
    return [
      {
        label: (entry as ComparisonCriterion).label,
        values: Array.isArray(values) ? values : [],
      },
    ];
  });
}

/**
 * Previous tool contract: `attributes` (keys read off the records) plus an
 * optional `columns` list labelling `[product, ...attributes]`.
 */
function legacyCriteria(
  objectIDs: string[],
  input: CompareProductsToolInput,
  records: ClientSideToolComponentProps['context']['records']
): ComparisonCriterion[] {
  const attributes = stringList(input.attributes);
  const columns = Array.isArray(input.columns)
    ? stringList(input.columns)
    : undefined;
  const labels =
    columns && columns.length === attributes.length + 1
      ? columns.slice(1)
      : columns;

  return criteriaFromAttributes(objectIDs, attributes, records, labels);
}

export function createCompareProductsToolComponent<
  THit extends RecordWithObjectID = RecordWithObjectID,
>({ createElement, Fragment }: Renderer) {
  const GroundedComparisonTable = createGroundedComparisonTableComponent<THit>({
    createElement,
    Fragment,
  });

  return function CompareProductsTool(
    userProps: CompareProductsToolProps<THit>
  ) {
    const {
      toolProps,
      itemComponent,
      translations: userTranslations,
    } = userProps;
    const { message, records, sendEvent } = toolProps.context;

    const translations: ComparisonTableTranslations = {
      ...defaultComparisonTableTranslations,
      ...userTranslations,
    };

    if (
      !message ||
      (message.state !== 'input-streaming' &&
        message.state !== 'input-available' &&
        message.state !== 'output-available')
    ) {
      return <Fragment />;
    }

    const input = (message.input ?? {}) as CompareProductsToolInput;
    // While the arguments stream in, `input` is parsed with partial-JSON
    // repair, so the value under the cursor looks complete when it isn't. The
    // table grows as the settled part of the document does: all the columns
    // once `objectIDs` has closed, then one row per finished criterion.
    const cursor =
      message.state === 'input-streaming'
        ? typeof message.rawInput === 'string'
          ? getJsonCursor(message.rawInput)
          : undefined
        : undefined;
    const settled = (key: keyof CompareProductsToolInput) =>
      !cursor || !endsInsideRootProperty(cursor, key);

    if (message.state === 'input-streaming' && !cursor) {
      return <Fragment />;
    }

    const objectIDs = settled('objectIDs') ? stringList(input.objectIDs) : [];
    const intro =
      settled('intro') && typeof input.intro === 'string'
        ? input.intro
        : undefined;

    if (objectIDs.length === 0) {
      return <Fragment />;
    }

    // The row under the cursor (a frame below the `criteria` array) is still
    // being written — its label or last value may be cut mid-string.
    const criteriaRowInProgress =
      cursor !== undefined &&
      cursor.frames[1]?.key === 'criteria' &&
      cursor.frames.length > 2;
    const rawCriteria = Array.isArray(input.criteria) ? input.criteria : [];
    const criteria =
      input.criteria !== undefined
        ? criteriaList(
            criteriaRowInProgress ? rawCriteria.slice(0, -1) : rawCriteria
          )
        : legacyCriteria(objectIDs, input, records);

    return (
      <GroundedComparisonTable
        intro={intro}
        objectIDs={objectIDs}
        criteria={criteria}
        records={records}
        itemComponent={itemComponent}
        sendEvent={sendEvent}
        translations={translations}
      />
    );
  };
}
