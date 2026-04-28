import type { GeneratorContext, GenerateResult } from '../../../shared-types';

export function generate(ctx: GeneratorContext): GenerateResult {
  const attribute = ctx.params.attribute as string;

  const code = `import { RefinementList as InstantSearchRefinementList } from 'react-instantsearch';

export function ${ctx.widgetName}() {
  return <InstantSearchRefinementList attribute="${attribute}" />;
}
`;

  return { code, imports: [] };
}
