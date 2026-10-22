import {
  CompareProductsToolType,
  compareProductsToolDefinition,
} from '../compareProductsTool';

describe('compareProductsToolDefinition', () => {
  test('is a client-side tool named after the renderer', () => {
    expect(compareProductsToolDefinition.type).toBe('client_side');
    expect(compareProductsToolDefinition.name).toBe(CompareProductsToolType);
    expect(compareProductsToolDefinition.name).toBe('algolia_compare_products');
  });

  test('fits the Agent Studio description limit', () => {
    expect(compareProductsToolDefinition.description.length).toBeGreaterThan(0);
    expect(
      compareProductsToolDefinition.description.length
    ).toBeLessThanOrEqual(200);
  });

  test('declares the input the built-in table renderer consumes', () => {
    const { inputSchema } = compareProductsToolDefinition;

    expect(inputSchema.type).toBe('object');
    expect(Object.keys(inputSchema.properties).sort()).toEqual([
      'criteria',
      'intro',
      'objectIDs',
    ]);
    expect(inputSchema.required).toEqual(['objectIDs', 'criteria', 'intro']);

    expect(inputSchema.properties.objectIDs).toMatchObject({
      type: 'array',
      items: { type: 'string' },
    });
    expect(inputSchema.properties.criteria).toMatchObject({
      type: 'array',
      items: {
        type: 'object',
        properties: {
          label: { type: 'string' },
          values: { type: 'array', items: { type: ['string', 'null'] } },
        },
        required: ['label', 'values'],
        additionalProperties: false,
      },
    });
    expect(inputSchema.properties.intro).toMatchObject({
      type: ['string', 'null'],
    });
  });

  test('is plain JSON, so it can be sent to the Agent Studio API as is', () => {
    expect(JSON.parse(JSON.stringify(compareProductsToolDefinition))).toEqual(
      compareProductsToolDefinition
    );
  });
});
