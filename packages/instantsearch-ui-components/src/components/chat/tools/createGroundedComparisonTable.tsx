/** @jsx createElement */

import type { ChatRecord, ChatRecordsStore } from '../../../lib/utils';
import type {
  RecommendItemComponentProps,
  RecordWithObjectID,
  Renderer,
} from '../../../types';

/**
 * Shared presentational component for chat comparison tables. Used by the
 * builtin `algolia_compare_products` tool (`CompareProductsTool`) and the
 * `algolia_display_results` markdownTable path (`ComparisonTableTool`).
 *
 * Layout: the compared products run across the top (one column each, rendered
 * with the same item component as the search results so the comparison reads
 * as a display), and the comparison criteria run down the side (one row each).
 *
 * Products are identified by objectID only: the header is hydrated from the
 * chat records store (the records the search tools fetched or the user
 * selected), so the model never names a product that isn't in the catalog.
 * Criteria are model-authored: a label plus one value per product, which lets
 * the agent compare on aspects that aren't stored as a single attribute (a
 * feature buried in the description, a derived "best for" verdict, …). A
 * missing value renders as an explicit marker, never a made-up one.
 */

export type ComparisonTableTranslations = {
  /** Text shown in a cell when there is no value for a product. */
  missingValueLabel: string;
  /** Header of the criteria column (top-left corner of the table). */
  criteriaColumnLabel: string;
};

export const defaultComparisonTableTranslations: ComparisonTableTranslations = {
  missingValueLabel: '—',
  criteriaColumnLabel: '',
};

/** One row of the table: what is compared, and one value per product. */
export type ComparisonCriterion = {
  /** Model-authored row label, e.g. "Battery life". */
  label: string;
  /** One value per compared product, aligned to `objectIDs`. */
  values: unknown[];
};

/** The display name of a product, sourced ONLY from the catalog record. */
export function productLabel(hit: ChatRecord | undefined): unknown {
  if (!hit) {
    return undefined;
  }
  return hit.name ?? hit.title ?? hit.objectID;
}

/**
 * Values are arbitrary JSON. Primitives (and arrays of them) have an obvious
 * textual form; objects (e.g. `price: { value, currency }`) would stringify to
 * `[object Object]`, so they render as the missing marker instead — an honest
 * "no displayable value" beats a garbled cell.
 */
export function formatCellValue(value: unknown): string | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  if (Array.isArray(value)) {
    const printable = value.filter(
      (item): item is string | number | boolean =>
        (typeof item === 'string' && item !== '') ||
        typeof item === 'number' ||
        typeof item === 'boolean'
    );
    return printable.length > 0 ? printable.join(', ') : undefined;
  }
  if (typeof value === 'object') {
    return undefined;
  }
  return String(value);
}

/**
 * Builds criteria rows by reading attribute keys off the records: the
 * attribute-based contract, where the agent names only keys and the table
 * reads every value from the catalog record.
 */
export function criteriaFromAttributes(
  objectIDs: string[],
  attributes: string[],
  records: Pick<ChatRecordsStore, 'get'> | undefined,
  labels?: string[]
): ComparisonCriterion[] {
  // `labels` is model-authored and only trusted when it labels EVERY
  // attribute; a shorter list would shift labels onto the wrong rows.
  const rowLabels =
    labels && labels.length === attributes.length ? labels : undefined;

  return attributes.map((attribute, index) => ({
    label: rowLabels?.[index] ?? attribute,
    values: objectIDs.map((objectID) => records?.get(objectID)?.[attribute]),
  }));
}

export type GroundedComparisonTableProps<
  THit extends RecordWithObjectID = RecordWithObjectID,
> = {
  /** Optional model-authored lead-in (prose, rendered above the table). */
  intro?: string;
  /** Products to compare, one column each, referenced by objectID only. */
  objectIDs: string[];
  /** Comparison rows, each with one value per product. */
  criteria: ComparisonCriterion[];
  /** The records the chat has collected, keyed by `objectID`. */
  records?: Pick<ChatRecordsStore, 'get'>;
  /**
   * Renders a product in the header. Defaults to the record's name/title so the
   * header always comes from the catalog, never from the model.
   */
  itemComponent?: (
    props: RecommendItemComponentProps<RecordWithObjectID<THit>>
  ) => JSX.Element;
  sendEvent?: RecommendItemComponentProps<
    RecordWithObjectID<THit>
  >['sendEvent'];
  translations: ComparisonTableTranslations;
};

export function createGroundedComparisonTableComponent<
  THit extends RecordWithObjectID = RecordWithObjectID,
>({ createElement, Fragment }: Renderer) {
  return function GroundedComparisonTable(
    props: GroundedComparisonTableProps<THit>
  ) {
    const { intro, objectIDs, criteria, records, sendEvent } = props;
    const { itemComponent: ItemComponent, translations } = props;

    if (objectIDs.length === 0) {
      return <Fragment />;
    }

    return (
      <div className="ais-ChatToolComparisonTable">
        {intro && (
          <div className="ais-ChatToolComparisonTable-intro">{intro}</div>
        )}
        <table className="ais-ChatToolComparisonTable-table">
          <thead>
            <tr>
              <th
                scope="col"
                className="ais-ChatToolComparisonTable-header ais-ChatToolComparisonTable-corner"
              >
                {translations.criteriaColumnLabel}
              </th>
              {objectIDs.map((objectID) => {
                const hit = records?.get(objectID) as
                  | RecordWithObjectID<THit>
                  | undefined;

                return (
                  <th
                    key={objectID}
                    scope="col"
                    data-object-id={objectID}
                    data-testid={`product-${objectID}`}
                    className="ais-ChatToolComparisonTable-header ais-ChatToolComparisonTable-product"
                  >
                    {hit && ItemComponent && sendEvent ? (
                      <ItemComponent item={hit} sendEvent={sendEvent} />
                    ) : (
                      (formatCellValue(productLabel(hit)) ??
                      translations.missingValueLabel)
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {criteria.map((criterion, rowIndex) => (
              <tr
                key={`row-${rowIndex}`}
                className="ais-ChatToolComparisonTable-row"
              >
                <th
                  scope="row"
                  data-testid={`criterion-${rowIndex}`}
                  className="ais-ChatToolComparisonTable-criterion"
                >
                  {criterion.label}
                </th>
                {objectIDs.map((objectID, columnIndex) => (
                  <td
                    key={`${objectID}-${rowIndex}`}
                    data-testid={`cell-${objectID}-${rowIndex}`}
                    className="ais-ChatToolComparisonTable-cell"
                  >
                    {formatCellValue(criterion.values[columnIndex]) ??
                      translations.missingValueLabel}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
}
