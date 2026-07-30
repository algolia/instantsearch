/** @jsx createElement */

import { getHitsByObjectID } from '../../../lib/utils/chat';

import type { Hooks, RecordWithObjectID, Renderer } from '../../../types';
import type { ClientSideToolComponentProps } from '../types';

/**
 * Grounded comparison-table renderer (prototype).
 *
 * This is the "render the table from product IDs, not model text" fix from the
 * agentic-evals comparison study: the agent emits ONLY the product objectIDs and
 * the attribute *keys* to compare — never the values. Every cell is hydrated from
 * the actual `algolia_search_index` hits via `getHitsByObjectID`, so the model
 * physically cannot type (and therefore cannot hallucinate) a price or spec.
 *
 * Wire shape it consumes (a v2 `markdownTable` display block):
 *
 *   output.content = [
 *     {
 *       type: 'markdownTable',
 *       attributes: ['name', 'price', 'rating'],   // attribute KEYS (also headers)
 *       columns?: ['Product', 'Price', 'Rating'],  // optional display labels
 *       rows: [{ objectID: 'A' }, { objectID: 'B' }]  // one product per row
 *     }
 *   ]
 *
 * The first column is always the product (its `name`/`title`, sourced from the
 * hit). Remaining columns are the requested attributes, read off the hit. A
 * missing attribute renders as an explicit em-dash, never a fabricated value.
 */

export type ComparisonTableTranslations = {
  /** Text shown in a cell when the catalog record has no value for it. */
  missingValueLabel: string;
  /** Header for the first (product) column when no label is provided. */
  productColumnLabel: string;
};

type MarkdownTableRow = {
  objectID: string;
};

type MarkdownTableBlock = {
  type: 'markdownTable';
  /** Attribute keys to read off each hit (also used as default headers). */
  attributes?: string[];
  /** Optional display labels, aligned to `attributes`. */
  columns?: string[];
  rows?: MarkdownTableRow[];
};

type ComparisonTableOutput = {
  intro?: string;
  content?: Array<{ type?: string } & Partial<MarkdownTableBlock>>;
};

export type ComparisonTableCellProps = {
  /** Hydrated catalog record for this row (undefined if the hit is missing). */
  hit?: RecordWithObjectID;
  /** Attribute key to display (undefined for the product/name column). */
  attribute?: string;
  /** Resolved, catalog-sourced value (undefined if missing). */
  value?: unknown;
  isHeader: boolean;
};

export type ComparisonTableToolProps = {
  toolProps: ClientSideToolComponentProps;
  translations?: Partial<ComparisonTableTranslations>;
};

const DEFAULT_TRANSLATIONS: ComparisonTableTranslations = {
  missingValueLabel: '—',
  productColumnLabel: 'Product',
};

function firstMarkdownTable(
  output: ComparisonTableOutput | undefined
): MarkdownTableBlock | undefined {
  if (!output || !Array.isArray(output.content)) {
    return undefined;
  }
  const block = output.content.find((b) => b && b.type === 'markdownTable');
  if (!block || !Array.isArray(block.rows)) {
    return undefined;
  }
  return {
    type: 'markdownTable',
    attributes: Array.isArray(block.attributes) ? block.attributes : [],
    columns: Array.isArray(block.columns) ? block.columns : undefined,
    rows: block.rows.filter(
      (r): r is MarkdownTableRow =>
        Boolean(r) && typeof r.objectID === 'string' && r.objectID !== ''
    ),
  };
}

/** The display name of a product, sourced ONLY from the catalog hit. */
function productLabel(hit: RecordWithObjectID | undefined): unknown {
  if (!hit) {
    return undefined;
  }
  return hit.name ?? hit.title ?? hit.objectID;
}

/**
 * Everything the grounded table needs to render. Note there is deliberately no
 * field for attribute VALUES: they can only come from `hitsByObjectID`.
 */
export type GroundedComparisonTableProps = {
  /** Optional model-authored lead-in (prose, rendered above the table). */
  intro?: string;
  /** Products to compare, one row each, referenced by objectID only. */
  objectIDs: string[];
  /** Attribute keys to read off each hit (also used as default headers). */
  attributes: string[];
  /** Optional display labels: [productColumn, ...attributeColumns]. */
  columns?: string[];
  /** objectID -> catalog record, hydrated from real search hits. */
  hitsByObjectID: Record<string, RecordWithObjectID>;
  translations: ComparisonTableTranslations;
};

/**
 * Shared presentational component for grounded comparison tables. Used by both
 * the `algolia_display_results` markdownTable path (`ComparisonTableTool`) and
 * the builtin `algolia_compare_products` tool (`CompareProductsTool`).
 */
export function createGroundedComparisonTableComponent({
  createElement,
  Fragment,
}: Renderer) {
  return function GroundedComparisonTable(props: GroundedComparisonTableProps) {
    const { intro, objectIDs, attributes, columns, hitsByObjectID } = props;
    const { translations } = props;

    if (objectIDs.length === 0) {
      return <Fragment />;
    }

    const headerLabels = [
      columns?.[0] ?? translations.productColumnLabel,
      ...attributes.map((attr, index) => columns?.[index + 1] ?? attr),
    ];

    return (
      <div className="ais-ChatToolComparisonTable">
        {intro && (
          <div className="ais-ChatToolComparisonTable-intro">{intro}</div>
        )}
        <table className="ais-ChatToolComparisonTable-table">
          <thead>
            <tr>
              {headerLabels.map((label, index) => (
                <th
                  key={`h-${index}`}
                  scope="col"
                  className="ais-ChatToolComparisonTable-header"
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {objectIDs.map((objectID) => {
              const hit = hitsByObjectID[objectID] as
                | RecordWithObjectID
                | undefined;
              const name = productLabel(hit);

              return (
                <tr
                  key={objectID}
                  data-object-id={objectID}
                  className="ais-ChatToolComparisonTable-row"
                >
                  <th
                    scope="row"
                    data-testid={`product-${objectID}`}
                    className="ais-ChatToolComparisonTable-product"
                  >
                    {name === undefined
                      ? translations.missingValueLabel
                      : String(name)}
                  </th>
                  {attributes.map((attribute) => {
                    // The ONLY source of a cell value is the catalog hit.
                    const value = hit ? hit[attribute] : undefined;
                    const isMissing =
                      value === undefined || value === null || value === '';

                    return (
                      <td
                        key={`${objectID}-${attribute}`}
                        data-testid={`cell-${objectID}-${attribute}`}
                        className="ais-ChatToolComparisonTable-cell"
                      >
                        {isMissing
                          ? translations.missingValueLabel
                          : String(value)}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };
}

export function createComparisonTableToolComponent({
  createElement,
  Fragment,
  useMemo,
}: Renderer & Pick<Hooks, 'useMemo'>) {
  const GroundedComparisonTable = createGroundedComparisonTableComponent({
    createElement,
    Fragment,
  });

  return function ComparisonTableTool(userProps: ComparisonTableToolProps) {
    const { toolProps, translations: userTranslations } = userProps;
    const { message, messages } = toolProps;

    const translations: ComparisonTableTranslations = {
      ...DEFAULT_TRANSLATIONS,
      ...userTranslations,
    };

    const toolCallId = message?.toolCallId;
    const hitsByObjectID = useMemo(
      () => (messages ? getHitsByObjectID(messages, toolCallId) : {}),
      [messages, toolCallId]
    );

    const output = message?.output as ComparisonTableOutput | undefined;
    const intro = typeof output?.intro === 'string' ? output.intro : undefined;
    const table = firstMarkdownTable(output);

    if (!table || !table.rows || table.rows.length === 0) {
      return <Fragment />;
    }

    return (
      <GroundedComparisonTable
        intro={intro}
        objectIDs={table.rows.map((row) => row.objectID)}
        attributes={table.attributes ?? []}
        columns={table.columns}
        hitsByObjectID={hitsByObjectID}
        translations={translations}
      />
    );
  };
}
