import path from 'node:path';

import { generateExperience } from '../generator';
import {
  addExperienceToRoot,
  readRootManifestResult,
  resolveExperience,
  ROOT_MANIFEST_FILENAME,
  type ExperienceManifest,
  type ExperienceSchema,
} from '../manifest';
import type { Prompter } from '../prompter';
import { success, type Report } from '../reporter';
import { manifestReadFailure } from './manifest-errors';
import { resolveExperienceInputs } from './resolve-experience-inputs';
import { buildExperienceNextSteps, experienceImportBase } from '../utils/next-steps';
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

export async function addExperience(
  options: AddExperienceOptions
): Promise<Report> {
  const { projectDir, name, template, prompter } = options;

  const rootResult = readRootManifestResult(projectDir);
  if (!rootResult.ok) {
    return manifestReadFailure({
      command: COMMAND,
      result: rootResult,
      notFoundMessage:
        'No instantsearch.json found. Run `instantsearch init` before adding an experience.',
    });
  }
  const rootManifest = rootResult.manifest;

  const inputs = await resolveExperienceInputs({
    template,
    indexName: options.indexName,
    schema: options.schema,
    credentials: rootManifest.algolia,
    prompter,
    command: COMMAND,
  });
  if (!inputs.ok) return inputs.report;

  const experienceManifest: ExperienceManifest = {
    apiVersion: 1,
    indexName: inputs.indexName,
    widgets: inputs.widgets,
    ...(Object.keys(inputs.schema).length > 0 ? { schema: inputs.schema } : {}),
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
  addExperienceToRoot(projectDir, rootManifest, { name, path: experiencePath, indexName: inputs.indexName });

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
        widgets: inputs.widgets,
      }),
    },
  });
}
