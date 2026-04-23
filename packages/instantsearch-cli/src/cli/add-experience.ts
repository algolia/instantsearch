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
import { providerComponentName } from '../utils/naming';
import { writeGeneratedFiles } from '../utils/write-files';

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

function buildNextSteps(params: {
  experienceName: string;
  componentsPath: string;
  componentsAlias: string | undefined;
  widgets: string[];
}): { imports: string[]; mountingGuidance: string } {
  const providerName = providerComponentName(params.experienceName);
  const importBase = params.componentsAlias
    ? `${params.componentsAlias}/${params.experienceName}`
    : `${params.componentsPath}/${params.experienceName}`;
  const imports = [
    `import { ${providerName} } from '${importBase}/provider';`,
    ...params.widgets.map(
      (widget) => `import { ${widget} } from '${importBase}/${widget}';`
    ),
  ];
  return {
    imports,
    mountingGuidance: `Render <${providerName}> around the widgets wherever the search should appear.`,
  };
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
  const filesCreated = writeGeneratedFiles(projectDir, files);

  const experiencePath = path.posix.join(rootManifest.componentsPath, name);
  addExperienceToRoot(projectDir, rootManifest, { name, path: experiencePath });

  return success({
    command: COMMAND,
    payload: {
      experience: { name, path: experiencePath },
      filesCreated,
      manifestUpdated: ROOT_MANIFEST_FILENAME,
      nextSteps: buildNextSteps({
        experienceName: name,
        componentsPath: rootManifest.componentsPath,
        componentsAlias: rootManifest.aliases.components,
        widgets,
      }),
    },
  });
}
