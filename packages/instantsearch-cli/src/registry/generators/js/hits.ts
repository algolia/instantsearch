import type { GeneratorContext, GenerateResult } from '../../../shared-types';
export function generate(ctx: GeneratorContext): GenerateResult {
  const title = ctx.introspection.title as string;
  const image = ctx.introspection.image as string | undefined;
  const description = ctx.introspection.description as string | undefined;

  const lines = [
    image
      ? `          <img src="\${hit.${image}}" alt="\${hit.${title}}" />`
      : '',
    `          <h3>\${hit.${title}}</h3>`,
    description ? `          <p>\${hit.${description}}</p>` : '',
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
