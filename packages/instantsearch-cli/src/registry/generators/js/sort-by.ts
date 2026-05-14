import type { GeneratorContext, GenerateResult } from '../../../shared-types';
import { replicaLabel } from '../../../shared-types';
import { jsString } from '../../../utils/codegen';

export function generate(ctx: GeneratorContext): GenerateResult {
  const indexName = ctx.params.indexName as string;
  const replicas = ctx.params.replicas as string[];

  const itemsStr = [
    `  { value: ${jsString(indexName)}, label: ${jsString('Featured')} }`,
    ...replicas.map(
      (replica) =>
        `  { value: ${jsString(replica)}, label: ${jsString(replicaLabel(replica, indexName))} }`
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
