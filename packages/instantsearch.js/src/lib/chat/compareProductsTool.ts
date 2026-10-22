export const CompareProductsToolType = 'algolia_compare_products';

/**
 * A client-side tool as Agent Studio stores it in an agent's `tools`
 * (`POST /agent-studio/1/agents`).
 */
export type CompareProductsToolDefinition = {
  type: 'client_side';
  name: typeof CompareProductsToolType;
  /** At most 200 characters: the Agent Studio limit for a tool description. */
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required: string[];
  };
};

/**
 * The `algolia_compare_products` client-side tool, as the `chat` widget's
 * built-in comparison table renderer expects its input.
 *
 * Enabling a comparison configuration in the Agent Studio dashboard adds this
 * tool to the agent. When you manage the agent through the API instead, add
 * this definition to its `tools` so the agent can render the comparison as a
 * table rather than as Markdown.
 *
 * `criteria` is an array of rows rather than an object keyed by criterion so
 * the row order is explicit and the schema stays valid under strict-mode
 * providers, which reject free-form object keys.
 */
export const compareProductsToolDefinition: CompareProductsToolDefinition = {
  type: 'client_side',
  name: CompareProductsToolType,
  description:
    'Renders a comparison table for the user: selected products across the top, one row per criterion. Pass objectIDs and criteria with one value per product from the records. Never repeat it in text.',
  inputSchema: {
    type: 'object',
    properties: {
      objectIDs: {
        type: 'array',
        description:
          'The objectIDs of the products to compare, one column each, in display order',
        items: { type: 'string' },
      },
      criteria: {
        type: 'array',
        description:
          'The comparison rows. Each row has a short label and one value per product, in the same order as objectIDs. Take values from the product records, including details from the description; use null when a record has no value.',
        items: {
          type: 'object',
          properties: {
            label: {
              type: 'string',
              description: 'Short row label, e.g. "Battery life"',
            },
            values: {
              type: 'array',
              description:
                'One value per product, aligned to objectIDs; null when not listed',
              items: { type: ['string', 'null'] },
            },
          },
          required: ['label', 'values'],
          additionalProperties: false,
        },
      },
      intro: {
        type: ['string', 'null'],
        description: 'Optional one-line introduction shown above the table',
      },
    },
    required: ['objectIDs', 'criteria', 'intro'],
  },
};
