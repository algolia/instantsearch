import type { ExperienceSchema } from '../manifest';
import type { Prompter } from '../prompter';
import { failure, type Report } from '../reporter';
import { addExperience } from './add-experience';
import { addWidget } from './add-widget';
import { toPascalCase } from '../utils/naming';
import { SUPPORTED_WIDGETS } from '../generator';

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
  prompter?: Prompter;
};

function isWidgetName(name: string): boolean {
  return (SUPPORTED_WIDGETS as readonly string[]).includes(toPascalCase(name));
}

export async function add(options: AddOptions): Promise<Report> {
  const { projectDir, item, prompter } = options;

  const template = COMPOSITE_FEATURES[item as keyof typeof COMPOSITE_FEATURES];
  if (template) {
    return addExperience({
      projectDir,
      name: options.target ?? item,
      template,
      indexName: options.indexName,
      schema: options.schema,
      prompter,
    });
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
