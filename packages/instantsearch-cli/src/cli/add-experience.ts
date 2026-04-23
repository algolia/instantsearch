import path from 'node:path';

import { generateExperience } from '../generator';
import { introspectRecords } from '../introspector';
import {
  addExperienceToRoot,
  readRootManifest,
  resolveExperience,
  ROOT_MANIFEST_FILENAME,
  type ExperienceManifest,
  type ExperienceSchema,
} from '../manifest';
import { success, failure, type Report } from '../reporter';
import { buildExperienceNextSteps, experienceImportBase } from '../utils/next-steps';
import { writeOrConflict } from '../utils/write-files';

const COMMAND = 'add experience';

export type AddExperienceOptions = {
  projectDir: string;
  name: string;
  template: string;
  indexName: string;
  schema?: ExperienceSchema;
};

const TEMPLATE_WIDGETS: Record<string, string[]> = {
  search: [
    'SearchBox',
    'Hits',
    'RefinementList',
    'SortBy',
    'Pagination',
    'ClearRefinements',
  ],
};

function missingSchemaParts(
  widgets: string[],
  schema: ExperienceSchema | undefined
): string[] {
  const missing: string[] = [];
  if (widgets.includes('Hits') && !schema?.hits?.title) {
    missing.push('--hits-title');
  }
  if (widgets.includes('RefinementList') && !schema?.refinementList?.attribute) {
    missing.push('--refinement-list-attribute');
  }
  if (
    widgets.includes('SortBy') &&
    (!schema?.sortBy?.replicas || schema.sortBy.replicas.length === 0)
  ) {
    missing.push('--sort-by-replicas');
  }
  return missing;
}

export async function addExperience(
  options: AddExperienceOptions
): Promise<Report> {
  const { projectDir, name, template, indexName, schema } = options;

  const rootManifest = readRootManifest(projectDir);
  if (!rootManifest) {
    return failure({
      command: COMMAND,
      code: 'not_initialized',
      message:
        'No instantsearch.json found. Run `instantsearch init` before adding an experience.',
    });
  }

  const widgets = TEMPLATE_WIDGETS[template];
  if (!widgets) {
    return failure({
      command: COMMAND,
      code: 'unknown_template',
      message: `Unknown template '${template}'. Supported templates: ${Object.keys(TEMPLATE_WIDGETS).join(', ')}.`,
    });
  }

  const missingFlags = missingSchemaParts(widgets, schema);
  if (missingFlags.length > 0) {
    return failure({
      command: COMMAND,
      code: 'missing_schema',
      message: `Missing schema inputs for template '${template}': ${missingFlags.join(', ')}.`,
    });
  }

  const introspection = await introspectRecords({
    appId: rootManifest.algolia.appId,
    searchApiKey: rootManifest.algolia.searchApiKey,
    indexName,
  });
  if (!introspection.ok) {
    return failure({
      command: COMMAND,
      code: introspection.code,
      message: introspection.message,
    });
  }

  const experienceManifest: ExperienceManifest = {
    apiVersion: 1,
    indexName,
    widgets,
    ...(schema ? { schema } : {}),
  };

  const resolved = resolveExperience(rootManifest, {
    name,
    experience: experienceManifest,
  });

  const files = generateExperience(resolved);
  const outcome = writeOrConflict(projectDir, files, COMMAND);
  if (!outcome.ok) return outcome.failure;

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
        widgets,
      }),
    },
  });
}
