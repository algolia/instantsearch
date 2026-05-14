import type { GeneratorContext, GenerateResult } from '../../../shared-types';
import { propertyAccess } from '../../../utils/codegen';

export function generate(ctx: GeneratorContext): GenerateResult {
  const title = ctx.introspection.title as string;
  const image = ctx.introspection.image as string | undefined;
  const description = ctx.introspection.description as string | undefined;

  const lines = [
    image
      ? `          <img src="\${${propertyAccess('hit', image)}}" alt="\${${propertyAccess('hit', title)}}" />`
      : '',
    `          <h3>\${${propertyAccess('hit', title)}}</h3>`,
    description ? `          <p>\${${propertyAccess('hit', description)}}</p>` : '',
  ]
    .filter(Boolean)
    .join('\n');

  const code = `import { hits } from 'instantsearch.js/es/widgets';

export function ${ctx.widgetName}(container) {
  return hits({
    container,
    templates: {
      item: (hit, { html }) => html\`
        <article>
${lines}
        </article>
      \`,
    },
  });
}
`;

  return { code, imports: [] };
}
