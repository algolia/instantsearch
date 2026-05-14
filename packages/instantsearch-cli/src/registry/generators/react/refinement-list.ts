import type { GeneratorContext, GenerateResult } from '../../../shared-types';
import { jsString } from '../../../utils/codegen';

export function generate(ctx: GeneratorContext): GenerateResult {
  const attribute = ctx.params.attribute as string;

  const code = `import { RefinementList as InstantSearchRefinementList } from 'react-instantsearch';

export function ${ctx.widgetName}() {
  return <InstantSearchRefinementList attribute={${jsString(attribute)}} />;
}
`;

  return { code, imports: [] };
}
