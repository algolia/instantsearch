import type { GeneratorContext, GenerateResult } from '../../../shared-types';

export function generate(ctx: GeneratorContext): GenerateResult {
  const factory = ctx.widgetName[0].toLowerCase() + ctx.widgetName.slice(1);

  const code = `import { ${factory} } from 'instantsearch.js/es/widgets';

export function ${ctx.widgetName}(container) {
  return ${factory}({ container });
}
`;

  return { code, imports: [] };
}
