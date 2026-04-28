import path from 'node:path';

import { generateExperience, type WidgetName } from '../generator';
import { getSchemaStatus } from '../registry';
import {
  introspectRecords,
  introspectFacets,
  introspectReplicas,
  listIndices,
  type RecordsResult,
  type IntrospectParams,
} from '../introspector';
import {
  addExperienceToRoot,
  readRootManifest,
  resolveExperience,
  ROOT_MANIFEST_FILENAME,
  type ExperienceManifest,
  type ExperienceSchema,
} from '../manifest';
import type { Prompter } from '../prompter';
import { success, failure, type Report } from '../reporter';
import { refinementListWidgetName } from '../utils/naming';
import { buildExperienceNextSteps, experienceImportBase } from '../utils/next-steps';
import { parseCommaSeparated } from '../utils/parsing';
import { writeOrConflict } from '../utils/write-files';

const COMMAND = 'add experience';

export type AddExperienceOptions = {
  projectDir: string;
  name: string;
  template: string;
  indexName?: string;
  schema?: ExperienceSchema;
  prompter?: Prompter;
};

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
        report: failure({ command, code: 'missing_required_flag', message: 'Missing required flags: --index' }),
      };
    }
    indexName = await prompter.text('Which Algolia index should this experience use?');
  }

  if (!prompter) return { ok: true, indexName, probe: null };

  const probe = await introspectRecords({ appId, searchApiKey, indexName });
  if (probe.ok || probe.code !== 'index_not_found') {
    return { ok: true, indexName, probe };
  }

  // index_not_found → list accessible indices and re-prompt once.
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

export async function addExperience(
  options: AddExperienceOptions
): Promise<Report> {
  const { projectDir, name, template, prompter } = options;

  const rootManifest = readRootManifest(projectDir);
  if (!rootManifest) {
    return failure({
      command: COMMAND,
      code: 'not_initialized',
      message:
        'No instantsearch.json found. Run `instantsearch init` before adding an experience.',
    });
  }

  const templateWidgets = TEMPLATE_WIDGETS[template];
  if (!templateWidgets) {
    return failure({
      command: COMMAND,
      code: 'unknown_template',
      message: `Unknown template '${template}'. Supported templates: ${Object.keys(TEMPLATE_WIDGETS).join(', ')}.`,
    });
  }

  let widgets: WidgetName[] = [...templateWidgets];

  const indexResolution = await resolveIndexName({
    initial: options.indexName,
    appId: rootManifest.algolia.appId,
    searchApiKey: rootManifest.algolia.searchApiKey,
    prompter,
    command: COMMAND,
  });
  if (!indexResolution.ok) return indexResolution.report;
  const indexName = indexResolution.indexName;

  const creds: IntrospectParams = {
    appId: rootManifest.algolia.appId,
    searchApiKey: rootManifest.algolia.searchApiKey,
    indexName,
  };

  let schema: ExperienceSchema = { ...(options.schema ?? {}) };

  const needsHitsPrompt = widgets.includes('Hits') && getSchemaStatus('Hits', schema) !== 'satisfied';
  const needsRLPrompt = widgets.includes('RefinementList') && getSchemaStatus('RefinementList', schema) !== 'satisfied';
  const needsSortByPrompt = widgets.includes('SortBy') && getSchemaStatus('SortBy', schema) !== 'satisfied';

  let introspectionDone = indexResolution.probe !== null;
  let skipSortBy = false;

  if (prompter && (needsHitsPrompt || needsRLPrompt || needsSortByPrompt)) {
    // Reuse probe from resolveIndexName if available; otherwise fetch now.
    const introspection = indexResolution.probe ?? await introspectRecords(creds);
    const introspectionOk = introspection.ok;
    const indexEmpty = !introspection.ok && introspection.code === 'index_empty';
    if (!introspection.ok && !indexEmpty) {
      return failure({ command: COMMAND, code: introspection.code, message: introspection.message });
    }
    introspectionDone = true;

    if (needsHitsPrompt) {
      if (introspectionOk) {
        const titleChoices = introspection.attributes.map((a) => ({ name: a, value: a }));
        const title = await prompter.select<string>('Which attribute is the hit title?', titleChoices);
        const imageChoices = [
          ...introspection.imageCandidates.map((a) => ({ name: a, value: a })),
          { name: '(none)', value: '' },
        ];
        const image = await prompter.select<string>('Which attribute is the hit image? (optional)', imageChoices);
        schema = { ...schema, hits: { title, ...(image ? { image } : {}) } };
      } else {
        const title = await prompter.text('Index is empty. Enter the title attribute name manually:');
        const image = await prompter.text('Enter the image attribute name (or leave empty):');
        schema = { ...schema, hits: { title, ...(image ? { image } : {}) } };
      }
    }

    // Facets and replicas are independent — fetch in parallel.
    const [facetsResult, replicasResult] = await Promise.all([
      needsRLPrompt ? introspectFacets(creds) : null,
      needsSortByPrompt ? introspectReplicas(creds) : null,
    ]);

    if (needsRLPrompt && facetsResult) {
      if (facetsResult.ok) {
        const facetChoices = facetsResult.facets.map((f) => ({ name: f, value: f }));
        const attributes = await prompter.multiSelect<string>('Which facet attributes for RefinementList?', facetChoices);
        schema = { ...schema, refinementList: attributes.map((a) => ({ attribute: a })) };
      } else if (facetsResult.code === 'index_has_no_facets') {
        const attribute = await prompter.text(
          'No facets configured. Enter a facet attribute name manually:'
        );
        schema = { ...schema, refinementList: [{ attribute }] };
      } else {
        return failure({ command: COMMAND, code: facetsResult.code, message: facetsResult.message });
      }
    }

    if (needsSortByPrompt && replicasResult) {
      if (replicasResult.ok) {
        const replicaChoices = replicasResult.replicas.map((r) => ({ name: r, value: r }));
        const replicas = await prompter.multiSelect<string>('Which replica indices for SortBy?', replicaChoices);
        schema = { ...schema, sortBy: { replicas } };
      } else if (replicasResult.code === 'settings_forbidden') {
        const raw = await prompter.text(
          'The search key lacks settings access. Enter replica index names (comma-separated):'
        );
        schema = { ...schema, sortBy: { replicas: parseCommaSeparated(raw) } };
      } else if (replicasResult.code === 'no_replicas') {
        const skip = await prompter.confirm('No replicas configured. Skip SortBy?', { default: true });
        if (skip) {
          skipSortBy = true;
        } else {
          const raw = await prompter.text('Enter replica index names (comma-separated):');
          schema = { ...schema, sortBy: { replicas: parseCommaSeparated(raw) } };
        }
      } else {
        return failure({ command: COMMAND, code: replicasResult.code, message: replicasResult.message });
      }
    }
  } else if (!prompter) {
    const missingFlags: string[] = [];
    widgets = widgets.filter((w) => {
      const status = getSchemaStatus(w, schema);
      if (status === 'skippable') return false;
      if (status !== 'satisfied') missingFlags.push(status.missing);
      return true;
    });
    if (missingFlags.length > 0) {
      return failure({
        command: COMMAND,
        code: 'missing_schema',
        message: `Missing schema inputs for template '${template}': ${missingFlags.join(', ')}.`,
      });
    }
  }

  if (!introspectionDone) {
    const introspection = await introspectRecords(creds);
    if (!introspection.ok) {
      return failure({
        command: COMMAND,
        code: introspection.code,
        message: introspection.message,
      });
    }
  }

  if (schema.refinementList && schema.refinementList.length > 1) {
    const names = schema.refinementList.map((e) => refinementListWidgetName(e.attribute));
    if (new Set(names).size < names.length) {
      return failure({
        command: COMMAND,
        code: 'duplicate_widget',
        message: `Two or more RefinementList attributes produce the same widget name. Use distinct attribute names.`,
      });
    }
  }

  const expandedWidgets = widgets.flatMap((w) => {
    if (w === 'RefinementList' && schema.refinementList && schema.refinementList.length > 0) {
      return schema.refinementList.map((entry) => refinementListWidgetName(entry.attribute));
    }
    return [w];
  });
  const finalWidgets = skipSortBy ? expandedWidgets.filter((w) => w !== 'SortBy') : expandedWidgets;

  const experienceManifest: ExperienceManifest = {
    apiVersion: 1,
    indexName,
    widgets: finalWidgets,
    ...(Object.keys(schema).length > 0 ? { schema } : {}),
  };

  const resolved = resolveExperience(rootManifest, {
    name,
    experience: experienceManifest,
  });

  const files = generateExperience(resolved);
  const outcome = writeOrConflict(projectDir, files, COMMAND);
  if (!outcome.ok) {
    outcome.failure.message += ' Use `add widget` to add individual widgets to an existing experience.';
    return outcome.failure;
  }

  const experiencePath = path.posix.join(rootManifest.componentsPath, name);
  addExperienceToRoot(projectDir, rootManifest, { name, path: experiencePath });

  return success({
    command: COMMAND,
    payload: {
      experience: { name, path: experiencePath },
      filesCreated: outcome.filesCreated,
      manifestUpdated: ROOT_MANIFEST_FILENAME,
      nextSteps: buildExperienceNextSteps({
        flavor: rootManifest.flavor,
        experienceName: name,
        importBase: experienceImportBase(rootManifest, name),
        widgets: finalWidgets,
      }),
    },
  });
}
