import { type WidgetName } from '../generator';
import { getSchemaStatus } from '../registry';
import {
  introspectRecords,
  introspectFacets,
  introspectReplicas,
  listIndices,
  type IntrospectParams,
  type RecordsResult,
} from '../introspector';
import type { AlgoliaCredentials } from '../types';
import type { ExperienceSchema } from '../manifest';
import type { Prompter } from '../prompter';
import { failure, type Report } from '../reporter';
import { refinementListWidgetName } from '../utils/naming';
import { parseCommaSeparated } from '../utils/parsing';

const TEMPLATE_WIDGETS: Record<string, WidgetName[]> = {
  search: [
    'SearchBox',
    'Hits',
    'RefinementList',
    'SortBy',
    'Pagination',
    'ClearRefinements',
  ],
};

type IndexResolution =
  | { ok: true; indexName: string; probe: RecordsResult | null }
  | { ok: false; report: Report };

type ExperienceInputsResolution =
  | {
      ok: true;
      indexName: string;
      schema: ExperienceSchema;
      widgets: string[];
    }
  | { ok: false; report: Report };

async function resolveIndexName(params: {
  initial: string | undefined;
  appId: string;
  searchApiKey: string;
  prompter: Prompter | undefined;
  command: string;
}): Promise<IndexResolution> {
  const { appId, searchApiKey, prompter, command } = params;
  let indexName = params.initial;

  if (!indexName) {
    if (!prompter) {
      return {
        ok: false,
        report: failure({
          command,
          code: 'missing_required_flag',
          message: 'Missing required flags: --index',
        }),
      };
    }
    indexName = await prompter.text('Which Algolia index should this experience use?');
  }

  if (!prompter) return { ok: true, indexName, probe: null };

  const probe = await introspectRecords({ appId, searchApiKey, indexName });
  if (probe.ok || probe.code !== 'index_not_found') {
    return { ok: true, indexName, probe };
  }

  const listed = await listIndices({ appId, searchApiKey });
  const choices = listed.ok
    ? listed.indices.map((n) => ({ name: n, value: n }))
    : [];

  if (choices.length > 0) {
    indexName = await prompter.select<string>(
      `Index '${indexName}' not found. Pick from your accessible indices:`,
      choices
    );
  } else {
    indexName = await prompter.text(`Index '${indexName}' not found. Enter an index name:`);
  }

  return { ok: true, indexName, probe: null };
}

function pruneNonInteractiveWidgets(params: {
  widgets: WidgetName[];
  schema: ExperienceSchema;
  template: string;
  command: string;
}): { ok: true; widgets: WidgetName[] } | { ok: false; report: Report } {
  const missingFlags: string[] = [];
  const widgets = params.widgets.filter((w) => {
    const status = getSchemaStatus(w, params.schema);
    if (status === 'skippable') return false;
    if (status !== 'satisfied') missingFlags.push(status.missing);
    return true;
  });

  if (missingFlags.length > 0) {
    return {
      ok: false,
      report: failure({
        command: params.command,
        code: 'missing_schema',
        message: `Missing schema inputs for template '${params.template}': ${missingFlags.join(', ')}.`,
      }),
    };
  }

  return { ok: true, widgets };
}

async function promptForMissingSchema(params: {
  command: string;
  creds: IntrospectParams;
  indexProbe: RecordsResult | null;
  initialSchema: ExperienceSchema;
  needsHitsPrompt: boolean;
  needsRefinementListPrompt: boolean;
  needsSortByPrompt: boolean;
  prompter: Prompter;
}): Promise<
  | {
      ok: true;
      schema: ExperienceSchema;
      introspectionDone: boolean;
      skipSortBy: boolean;
    }
  | { ok: false; report: Report }
> {
  const {
    command,
    creds,
    prompter,
    needsHitsPrompt,
    needsRefinementListPrompt,
    needsSortByPrompt,
  } = params;

  let schema = params.initialSchema;
  let skipSortBy = false;

  const introspection = params.indexProbe ?? await introspectRecords(creds);
  const introspectionOk = introspection.ok;
  const indexEmpty = !introspection.ok && introspection.code === 'index_empty';
  if (!introspection.ok && !indexEmpty) {
    return {
      ok: false,
      report: failure({
        command,
        code: introspection.code,
        message: introspection.message,
      }),
    };
  }

  if (needsHitsPrompt) {
    if (introspectionOk) {
      const titleChoices = introspection.attributes.map((a) => ({
        name: a,
        value: a,
      }));
      const title = await prompter.select<string>(
        'Which attribute is the hit title?',
        titleChoices
      );
      const imageChoices = [
        ...introspection.imageCandidates.map((a) => ({ name: a, value: a })),
        { name: '(none)', value: '' },
      ];
      const image = await prompter.select<string>(
        'Which attribute is the hit image? (optional)',
        imageChoices
      );
      schema = { ...schema, hits: { title, ...(image ? { image } : {}) } };
    } else {
      const title = await prompter.text(
        'Index is empty. Enter the title attribute name manually:'
      );
      const image = await prompter.text(
        'Enter the image attribute name (or leave empty):'
      );
      schema = { ...schema, hits: { title, ...(image ? { image } : {}) } };
    }
  }

  const [facetsResult, replicasResult] = await Promise.all([
    needsRefinementListPrompt ? introspectFacets(creds) : null,
    needsSortByPrompt ? introspectReplicas(creds) : null,
  ]);

  if (needsRefinementListPrompt && facetsResult) {
    if (facetsResult.ok) {
      const facetChoices = facetsResult.facets.map((f) => ({
        name: f,
        value: f,
      }));
      const attributes = await prompter.multiSelect<string>(
        'Which facet attributes for RefinementList?',
        facetChoices
      );
      schema = {
        ...schema,
        refinementList: attributes.map((a) => ({ attribute: a })),
      };
    } else if (facetsResult.code === 'index_has_no_facets') {
      const attribute = await prompter.text(
        'No facets configured. Enter a facet attribute name manually:'
      );
      schema = { ...schema, refinementList: [{ attribute }] };
    } else {
      return {
        ok: false,
        report: failure({
          command,
          code: facetsResult.code,
          message: facetsResult.message,
        }),
      };
    }
  }

  if (needsSortByPrompt && replicasResult) {
    if (replicasResult.ok) {
      const replicaChoices = replicasResult.replicas.map((r) => ({
        name: r,
        value: r,
      }));
      const replicas = await prompter.multiSelect<string>(
        'Which replica indices for SortBy?',
        replicaChoices
      );
      schema = { ...schema, sortBy: { replicas } };
    } else if (replicasResult.code === 'settings_forbidden') {
      const raw = await prompter.text(
        'The search key lacks settings access. Enter replica index names (comma-separated):'
      );
      schema = { ...schema, sortBy: { replicas: parseCommaSeparated(raw) } };
    } else if (replicasResult.code === 'no_replicas') {
      const skip = await prompter.confirm('No replicas configured. Skip SortBy?', {
        default: true,
      });
      if (skip) {
        skipSortBy = true;
      } else {
        const raw = await prompter.text(
          'Enter replica index names (comma-separated):'
        );
        schema = { ...schema, sortBy: { replicas: parseCommaSeparated(raw) } };
      }
    } else {
      return {
        ok: false,
        report: failure({
          command,
          code: replicasResult.code,
          message: replicasResult.message,
        }),
      };
    }
  }

  return {
    ok: true,
    schema,
    introspectionDone: true,
    skipSortBy,
  };
}

function assertDistinctRefinementListNames(params: {
  schema: ExperienceSchema;
  command: string;
}): { ok: true } | { ok: false; report: Report } {
  const { schema, command } = params;
  if (!schema.refinementList || schema.refinementList.length <= 1) {
    return { ok: true };
  }

  const names = schema.refinementList.map((e) =>
    refinementListWidgetName(e.attribute)
  );
  if (new Set(names).size === names.length) return { ok: true };

  return {
    ok: false,
    report: failure({
      command,
      code: 'duplicate_widget',
      message:
        'Two or more RefinementList attributes produce the same widget name. Use distinct attribute names.',
    }),
  };
}

function expandSchemaDrivenWidgets(params: {
  widgets: WidgetName[];
  schema: ExperienceSchema;
  skipSortBy: boolean;
}): string[] {
  const expandedWidgets = params.widgets.flatMap((w) => {
    if (
      w === 'RefinementList' &&
      params.schema.refinementList &&
      params.schema.refinementList.length > 0
    ) {
      return params.schema.refinementList.map((entry) =>
        refinementListWidgetName(entry.attribute)
      );
    }
    return [w];
  });

  return params.skipSortBy
    ? expandedWidgets.filter((w) => w !== 'SortBy')
    : expandedWidgets;
}

export async function resolveExperienceInputs(params: {
  template: string;
  indexName: string | undefined;
  schema: ExperienceSchema | undefined;
  credentials: AlgoliaCredentials;
  prompter: Prompter | undefined;
  command: string;
}): Promise<ExperienceInputsResolution> {
  const templateWidgets = TEMPLATE_WIDGETS[params.template];
  if (!templateWidgets) {
    return {
      ok: false,
      report: failure({
        command: params.command,
        code: 'unknown_template',
        message: `Unknown template '${params.template}'. Supported templates: ${Object.keys(TEMPLATE_WIDGETS).join(', ')}.`,
      }),
    };
  }

  let widgets: WidgetName[] = [...templateWidgets];
  let schema: ExperienceSchema = { ...(params.schema ?? {}) };

  const indexResolution = await resolveIndexName({
    initial: params.indexName,
    appId: params.credentials.appId,
    searchApiKey: params.credentials.searchApiKey,
    prompter: params.prompter,
    command: params.command,
  });
  if (!indexResolution.ok) return indexResolution;

  const creds: IntrospectParams = {
    ...params.credentials,
    indexName: indexResolution.indexName,
  };

  let introspectionDone = indexResolution.probe !== null;
  let skipSortBy = false;

  const needsHitsPrompt =
    widgets.includes('Hits') && getSchemaStatus('Hits', schema) !== 'satisfied';
  const needsRefinementListPrompt =
    widgets.includes('RefinementList') &&
    getSchemaStatus('RefinementList', schema) !== 'satisfied';
  const needsSortByPrompt =
    widgets.includes('SortBy') &&
    getSchemaStatus('SortBy', schema) !== 'satisfied';

  if (
    params.prompter &&
    (needsHitsPrompt || needsRefinementListPrompt || needsSortByPrompt)
  ) {
    const prompted = await promptForMissingSchema({
      command: params.command,
      creds,
      indexProbe: indexResolution.probe,
      initialSchema: schema,
      needsHitsPrompt,
      needsRefinementListPrompt,
      needsSortByPrompt,
      prompter: params.prompter,
    });
    if (!prompted.ok) return prompted;

    schema = prompted.schema;
    introspectionDone = prompted.introspectionDone;
    skipSortBy = prompted.skipSortBy;
  } else if (!params.prompter) {
    const pruned = pruneNonInteractiveWidgets({
      widgets,
      schema,
      template: params.template,
      command: params.command,
    });
    if (!pruned.ok) return pruned;
    widgets = pruned.widgets;
  }

  if (!introspectionDone) {
    const introspection = await introspectRecords(creds);
    if (!introspection.ok) {
      return {
        ok: false,
        report: failure({
          command: params.command,
          code: introspection.code,
          message: introspection.message,
        }),
      };
    }
  }

  const distinctNames = assertDistinctRefinementListNames({
    schema,
    command: params.command,
  });
  if (!distinctNames.ok) return distinctNames;

  return {
    ok: true,
    indexName: indexResolution.indexName,
    schema,
    widgets: expandSchemaDrivenWidgets({ widgets, schema, skipSortBy }),
  };
}
