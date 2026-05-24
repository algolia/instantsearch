import type { ExperienceSchema } from '../manifest';
import { parseCommaSeparated } from '../utils/parsing';

export type SchemaFlagOptions = {
  hitsTitle?: string;
  hitsImage?: string;
  hitsDescription?: string;
  refinementListAttribute?: string;
  sortByReplicas?: string;
};

function parseReplicasFlag(value: string | undefined): string[] | undefined {
  if (!value) return undefined;
  return parseCommaSeparated(value);
}

export function buildSchemaFromFlags(
  opts: SchemaFlagOptions
): ExperienceSchema {
  const schema: ExperienceSchema = {};
  if (opts.hitsTitle) {
    schema.hits = {
      title: opts.hitsTitle,
      ...(opts.hitsImage ? { image: opts.hitsImage } : {}),
      ...(opts.hitsDescription ? { description: opts.hitsDescription } : {}),
    };
  }
  if (opts.refinementListAttribute) {
    const attributes = parseCommaSeparated(opts.refinementListAttribute);
    schema.refinementList = attributes.map((a) => ({ attribute: a }));
  }
  const replicas = parseReplicasFlag(opts.sortByReplicas);
  if (replicas) {
    schema.sortBy = { replicas };
  }
  return schema;
}
