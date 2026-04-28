import type { GeneratorContext, GenerateResult } from '../../../shared-types';

export function generate(ctx: GeneratorContext): GenerateResult {
  const title = ctx.introspection.title as string;
  const image = ctx.introspection.image as string | undefined;
  const description = ctx.introspection.description as string | undefined;

  const fields: string[] = [title];
  if (image) fields.push(image);
  if (description) fields.push(description);

  const hitBodyLines: string[] = [];
  if (image) {
    hitBodyLines.push(`      <img src={hit.${image}} alt={hit.${title}} />`);
  }
  hitBodyLines.push(`      <h3>{hit.${title}}</h3>`);
  if (description) {
    hitBodyLines.push(`      <p>{hit.${description}}</p>`);
  }

  const hitBody = hitBodyLines.join('\n');

  let code: string;

  if (ctx.typescript) {
    const typeFields = fields.map((f) => `  ${f}: string;`).join('\n');

    code =
      `import { Hits as InstantSearchHits } from 'react-instantsearch';\n` +
      `\n` +
      `type HitRecord = {\n` +
      `${typeFields}\n` +
      `};\n` +
      `\n` +
      `function Hit({ hit }: { hit: HitRecord }) {\n` +
      `  return (\n` +
      `    <article>\n` +
      `${hitBody}\n` +
      `    </article>\n` +
      `  );\n` +
      `}\n` +
      `\n` +
      `export function Hits() {\n` +
      `  return <InstantSearchHits<HitRecord> hitComponent={Hit} />;\n` +
      `}\n`;
  } else {
    code =
      `import { Hits as InstantSearchHits } from 'react-instantsearch';\n` +
      `\n` +
      `function Hit({ hit }) {\n` +
      `  return (\n` +
      `    <article>\n` +
      `${hitBody}\n` +
      `    </article>\n` +
      `  );\n` +
      `}\n` +
      `\n` +
      `export function Hits() {\n` +
      `  return <InstantSearchHits hitComponent={Hit} />;\n` +
      `}\n`;
  }

  return { code, imports: [] };
}
