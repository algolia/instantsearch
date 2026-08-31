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
 * Grounded comparison-table renderer for `algolia_display_results` outputs.
 *
 * The agent emits a v2 `markdownTable` display block that names only the
 * product objectIDs and the attribute *keys* to compare — never the values.
 * Every cell is hydrated from the actual `algolia_search_index` hits via
 * `getHitsByObjectID`, so the model physically cannot type (and therefore
 * cannot hallucinate) a price or spec.
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

export type ComparisonTableToolProps = {
  toolProps: ClientSideToolComponentProps;
  translations?: Partial<ComparisonTableTranslations>;
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
      ...defaultComparisonTableTranslations,
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
