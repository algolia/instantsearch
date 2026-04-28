import type { GeneratorContext, GenerateResult } from '../../../shared-types';
import { replicaLabel } from '../../../shared-types';

export function generate(ctx: GeneratorContext): GenerateResult {
  const indexName = ctx.params.indexName as string;
  const replicas = ctx.params.replicas as string[];

  const items = [
    { value: indexName, label: 'Featured' },
    ...replicas.map((replica) => ({
      value: replica,
      label: replicaLabel(replica, indexName),
    })),
  ];

  const itemsStr = items
    .map((item) => `  { value: '${item.value}', label: '${item.label}' }`)
    .join(',\n');

  const code = `import { SortBy as InstantSearchSortBy } from 'react-instantsearch';

const items = [
${itemsStr},
];

export function ${ctx.widgetName}() {
  return <InstantSearchSortBy items={items} />;
}
`;

  return { code, imports: [] };
}
