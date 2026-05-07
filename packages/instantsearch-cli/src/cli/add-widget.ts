import path from 'node:path';

import {
  generateExperience,
  generateWidget,
  SUPPORTED_WIDGETS,
  type WidgetName,
} from '../generator';
import { introspectRecords } from '../introspector';
import {
  addExperienceToRoot,
  readRootManifestResult,
  resolveExperience,
  type ExperienceSchema,
  type RootManifest,
} from '../manifest';
import type { Prompter } from '../prompter';
import { success, failure, type Report } from '../reporter';
import { manifestReadFailure } from './manifest-errors';
import { toPascalCase, refinementListWidgetName } from '../utils/naming';
import {
  buildWidgetNextSteps,
  experienceImportBase,
} from '../utils/next-steps';
import { writeOrConflict } from '../utils/write-files';

const COMMAND = 'add widget';

export type AddWidgetOptions = {
  projectDir: string;
  experience: string;
  widget: string;
  indexName?: string;
  schema?: ExperienceSchema;
  prompter?: Prompter;
};

function resolveWidgetName(input: string): WidgetName | null {
  const pascal = toPascalCase(input);
  return SUPPORTED_WIDGETS.find((w) => w === pascal) ?? null;
}

function refinementListSuffixedName(
  widget: WidgetName,
  schema: ExperienceSchema | undefined
): string | null {
  if (widget === 'RefinementList' && schema?.refinementList && schema.refinementList.length > 0) {
    const last = schema.refinementList[schema.refinementList.length - 1];
    return refinementListWidgetName(last.attribute);
  }
  return null;
}

async function materializeExperience(params: {
  projectDir: string;
  rootManifest: RootManifest;
  experienceName: string;
  widget: WidgetName;
  indexName: string;
  schema: ExperienceSchema | undefined;
}): Promise<Report> {
  const { projectDir, rootManifest, experienceName, widget, indexName, schema } = params;

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

  const resolved = resolveExperience(rootManifest, {
    name: experienceName,
    experience: {
      apiVersion: 1,
      indexName,
      widgets: [widget],
      schema: schema ?? {},
    },
  });

  const outcome = writeOrConflict(projectDir, generateExperience(resolved), COMMAND);
  if (!outcome.ok) return outcome.failure;

  const experiencePath = path.posix.join(rootManifest.componentsPath, experienceName);
  addExperienceToRoot(projectDir, rootManifest, {
    name: experienceName,
    path: experiencePath,
    indexName,
  });

  return success({
    command: COMMAND,
    payload: {
      experience: { name: experienceName, path: experiencePath },
      widget,
      filesCreated: outcome.filesCreated,
      nextSteps: buildWidgetNextSteps({
        flavor: rootManifest.flavor,
        experienceName,
        importBase: experienceImportBase(rootManifest, experienceName),
        widget,
        fileName: widget,
        includeProvider: true,
      }),
    },
  });
}

export async function addWidget(options: AddWidgetOptions): Promise<Report> {
  const {
    projectDir,
    experience: experienceName,
    widget: widgetInput,
    indexName,
    schema,
  } = options;

  const rootResult = readRootManifestResult(projectDir);
  if (!rootResult.ok) {
    return manifestReadFailure({
      command: COMMAND,
      result: rootResult,
      notFoundMessage:
        'No instantsearch.json found. Run `instantsearch init` before adding a widget.',
    });
  }
  const rootManifest = rootResult.manifest;

  const widget = resolveWidgetName(widgetInput);
  if (!widget) {
    return failure({
      command: COMMAND,
      code: 'unknown_widget',
      message: `Unknown widget '${widgetInput}'. Supported: ${SUPPORTED_WIDGETS.join(', ')}.`,
    });
  }

  const entry = rootManifest.features.find((e) => e.name === experienceName);
  if (!entry) {
    let resolvedIndex = indexName;
    if (!resolvedIndex && options.prompter) {
      resolvedIndex = await options.prompter.text(
        `Experience '${experienceName}' does not exist. Enter an Algolia index to create it:`
      );
    }
    if (!resolvedIndex) {
      return failure({
        command: COMMAND,
        code: 'index_required',
        message: `Experience '${experienceName}' does not exist. Pass --index <name> to create it.`,
      });
    }
    return materializeExperience({
      projectDir,
      rootManifest,
      experienceName,
      widget,
      indexName: resolvedIndex,
      schema,
    });
  }

  const newSchema = schema ?? {};
  const suffixedName = refinementListSuffixedName(widget, newSchema);

  const resolved = resolveExperience(rootManifest, {
    name: experienceName,
    experience: {
      apiVersion: 1,
      indexName: entry.indexName,
      widgets: [widget],
      schema: newSchema,
    },
  });

  const files = generateWidget(resolved, {
    widget,
    ...(suffixedName ? { fileName: suffixedName } : {}),
  });

  const outcome = writeOrConflict(projectDir, files, COMMAND);
  if (!outcome.ok) return outcome.failure;

  return success({
    command: COMMAND,
    payload: {
      experience: { name: experienceName, path: entry.path },
      widget,
      filesCreated: outcome.filesCreated,
      nextSteps: buildWidgetNextSteps({
        flavor: rootManifest.flavor,
        experienceName,
        importBase: experienceImportBase(rootManifest, experienceName),
        widget,
        fileName: suffixedName ?? widget,
        includeProvider: false,
      }),
    },
  });
}
