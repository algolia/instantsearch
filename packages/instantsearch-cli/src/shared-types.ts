export type ParamSource =
  | 'facet'
  | 'replica'
  | 'searchableAttribute'
  | 'userDefined';

export type ParamDescriptor = {
  required: boolean;
  source: ParamSource;
};

export type WidgetMeta = {
  name: string;
  params: Record<string, ParamDescriptor>;
  introspection?: Record<string, ParamDescriptor>;
};

export type GeneratorContext = {
  widgetName: string;
  typescript: boolean;
  params: Record<string, unknown>;
  introspection: Record<string, unknown>;
};

export type GenerateResult = {
  code: string;
  imports: Array<{ from: string; names: string[] }>;
};

export function replicaLabel(replica: string, indexName: string): string {
  const suffix = replica.startsWith(`${indexName}_`)
    ? replica.slice(indexName.length + 1)
    : replica;
  return suffix.replace(/_/g, ' ');
}
