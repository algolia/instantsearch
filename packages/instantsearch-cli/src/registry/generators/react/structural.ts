import type { GeneratorContext, GenerateResult } from '../../../shared-types';

export function generate(ctx: GeneratorContext): GenerateResult {
  const code = `import { ${ctx.widgetName} as InstantSearch${ctx.widgetName} } from 'react-instantsearch';

export function ${ctx.widgetName}() {
  return <InstantSearch${ctx.widgetName} />;
}
`;

  return { code, imports: [] };
}
