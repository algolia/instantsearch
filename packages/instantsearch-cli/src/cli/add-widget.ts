import fs from 'node:fs';
import path from 'node:path';

import {
  generateExperience,
  generateWidget,
  widgetFilePath,
  SUPPORTED_WIDGETS,
  type WidgetName,
} from '../generator';
import { introspectRecords } from '../introspector';
import {
  addExperienceToRoot,
  readRootManifest,
  readExperienceManifest,
  writeExperienceManifest,
  resolveExperience,
  type ExperienceSchema,
  type RootManifest,
} from '../manifest';
import { success, failure, type Report } from '../reporter';
import { toPascalCase } from '../utils/naming';
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
};

function resolveWidgetName(input: string): WidgetName | null {
  const pascal = toPascalCase(input);
  return SUPPORTED_WIDGETS.find((w) => w === pascal) ?? null;
}

function attributeSuffix(
  widget: WidgetName,
  schema: ExperienceSchema | undefined
): string | null {
  if (widget === 'RefinementList' && schema?.refinementList?.attribute) {
    return toPascalCase(schema.refinementList.attribute);
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

  const rootManifest = readRootManifest(projectDir);
  if (!rootManifest) {
    return failure({
      command: COMMAND,
      code: 'not_initialized',
      message:
        'No instantsearch.json found. Run `instantsearch init` before adding a widget.',
    });
  }

  const widget = resolveWidgetName(widgetInput);
  if (!widget) {
    return failure({
      command: COMMAND,
      code: 'unknown_widget',
      message: `Unknown widget '${widgetInput}'. Supported: ${SUPPORTED_WIDGETS.join(', ')}.`,
    });
  }

  const entry = rootManifest.experiences.find((e) => e.name === experienceName);
  if (!entry) {
    if (!indexName) {
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
      indexName,
      schema,
    });
  }

  const experienceDir = path.join(projectDir, entry.path);
  const experienceManifest = readExperienceManifest(experienceDir);
  if (!experienceManifest) {
    return failure({
      command: COMMAND,
      code: 'not_initialized',
      message: `Experience manifest missing at '${entry.path}'.`,
    });
  }

  const mergedSchema: ExperienceSchema = {
    ...(experienceManifest.schema ?? {}),
    ...(schema ?? {}),
  };

  const resolved = resolveExperience(rootManifest, {
    name: experienceName,
    experience: {
      apiVersion: 1,
      indexName: experienceManifest.indexName,
      widgets: experienceManifest.widgets,
      schema: mergedSchema,
    },
  });

  const defaultPath = widgetFilePath(resolved, widget);
  const collides = fs.existsSync(path.join(projectDir, defaultPath));
  const suffix = attributeSuffix(widget, mergedSchema);
  const suffixedName = collides && suffix ? `${widget}${suffix}` : null;
  const files = generateWidget(resolved, {
    widget,
    ...(suffixedName ? { fileName: suffixedName } : {}),
  });

  const outcome = writeOrConflict(projectDir, files, COMMAND);
  if (!outcome.ok) return outcome.failure;

  writeExperienceManifest(experienceDir, {
    ...experienceManifest,
    widgets: [...experienceManifest.widgets, suffixedName ?? widget],
    schema: mergedSchema,
  });

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
