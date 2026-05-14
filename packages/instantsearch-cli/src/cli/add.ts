import path from 'node:path';

import type { ExperienceSchema, RootManifest } from '../manifest';
import type { InputType } from '../types';
import { readRootManifest } from '../manifest';
import type { Prompter } from '../prompter';
import { failure, type Report } from '../reporter';
import { addExperience } from './add-experience';
import { addWidget } from './add-widget';
import { toPascalCase } from '../utils/naming';
import { SUPPORTED_WIDGETS } from '../generator';
import { generateAutocomplete } from '../generator/autocomplete';
import { writeOrConflict } from '../utils/write-files';

const COMMAND = 'add';

const COMPOSITE_FEATURES = {
  search: 'search',
} as const;

export type AddOptions = {
  projectDir: string;
  item: string;
  target?: string;
  indexName?: string;
  schema?: ExperienceSchema;
  input?: InputType;
  prompter?: Prompter;
};

function isWidgetName(name: string): boolean {
  return (SUPPORTED_WIDGETS as readonly string[]).includes(toPascalCase(name));
}

export async function add(options: AddOptions): Promise<Report> {
  const { projectDir, item, prompter } = options;

  const template = COMPOSITE_FEATURES[item as keyof typeof COMPOSITE_FEATURES];
  if (template) {
    const input = options.input ?? 'autocomplete';
    const report = await addExperience({
      projectDir,
      name: options.target ?? item,
      template,
      indexName: options.indexName,
      schema: options.schema,
      input,
      prompter,
    });

    if (report.ok && input === 'autocomplete' && options.indexName && options.schema) {
      const rootManifest = readRootManifest(projectDir);
      if (rootManifest) {
        const autocomplete = maybeGenerateAutocomplete({
          projectDir,
          manifest: rootManifest,
          indexName: options.indexName,
          schema: options.schema,
        });
        if (autocomplete.created) {
          const payload = report as Record<string, unknown>;
          const files = payload.filesCreated as string[] | undefined;
          if (files) {
            files.push(autocomplete.filePath);
          }
        }
      }
    }

    return report;
  }

  if (isWidgetName(item) && options.target) {
    return addWidget({
      projectDir,
      experience: options.target,
      widget: item,
      indexName: options.indexName,
      schema: options.schema,
      prompter,
    });
  }

  if (isWidgetName(item)) {
    return failure({
      command: COMMAND,
      code: 'target_required',
      message: `Widget '${item}' requires a target feature. Usage: add ${item} <feature-name>`,
    });
  }

  return failure({
    command: COMMAND,
    code: 'unknown_item',
    message: `Unknown item '${item}'.`,
  });
}

function maybeGenerateAutocomplete(params: {
  projectDir: string;
  manifest: RootManifest;
  indexName: string;
  schema: ExperienceSchema;
}): { created: true; filePath: string } | { created: false } {
  const { projectDir, manifest, indexName, schema } = params;
  const ext = manifest.typescript ? 'tsx' : 'jsx';
  const relativePath = path.posix.join(manifest.componentsPath, 'autocomplete', `Autocomplete.${ext}`);

  const code = generateAutocomplete({
    indexName,
    hitsSchema: schema.hits,
    typescript: manifest.typescript,
  });

  const files = new Map([[relativePath, code]]);
  const outcome = writeOrConflict(projectDir, files, 'add');
  if (!outcome.ok) return { created: false };

  return { created: true, filePath: relativePath };
}
