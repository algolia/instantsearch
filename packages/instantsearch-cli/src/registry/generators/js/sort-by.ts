import type { GeneratorContext, GenerateResult } from '../../../shared-types';
import { replicaLabel } from '../../../shared-types';

export function generate(ctx: GeneratorContext): GenerateResult {
  const indexName = ctx.params.indexName as string;
  const replicas = ctx.params.replicas as string[];

  const itemsStr = [
    `  { value: '${indexName}', label: 'Featured' }`,
    ...replicas.map(
      (replica) =>
        `  { value: '${replica}', label: '${replicaLabel(replica, indexName)}' }`
    ),
  ].join(',\n');

  const code = `import { sortBy } from 'instantsearch.js/es/widgets';

const items = [
${itemsStr},
];

export function ${ctx.widgetName}(container) {
  return sortBy({ container, items });
}
`;

  return { code, imports: [] };
}
