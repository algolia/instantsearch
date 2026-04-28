import type { GeneratorContext, GenerateResult } from '../../../shared-types';
import { jsString } from '../../../utils/codegen';

export function generate(ctx: GeneratorContext): GenerateResult {
  const attribute = ctx.params.attribute as string;

  const code = `import { refinementList } from 'instantsearch.js/es/widgets';

export function ${ctx.widgetName}(container) {
  return refinementList({
    container,
    attribute: ${jsString(attribute)},
  });
}
`;

  return { code, imports: [] };
}
