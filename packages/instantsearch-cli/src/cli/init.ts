import { detect } from '../detector';
import { generate } from '../generator';
import { verifyCredentials } from '../introspector';
import {
  writeRootManifest,
  ROOT_MANIFEST_FILENAME,
  type RootManifest,
} from '../manifest';
import type { Prompter } from '../prompter';
import { success, failure, type Report } from '../reporter';
import type { Flavor, Framework } from '../types';
import { writeGeneratedFiles } from '../utils/write-files';

const COMMAND = 'init';

export type InitOptions = {
  projectDir: string;
  flavor?: Flavor;
  framework?: Framework;
  componentsPath?: string;
  appId?: string;
  searchApiKey?: string;
  prompter?: Prompter;
};

export async function init(options: InitOptions): Promise<Report> {
  const {
    projectDir,
    flavor: flavorOverride,
    framework: frameworkOverride,
    componentsPath: componentsPathOverride,
    prompter,
  } = options;

  const detection = detect(projectDir, { frameworkOverride });
  if (!detection.ok) {
    return failure({
      command: COMMAND,
      code: detection.code,
      message: detection.message,
    });
  }

  let appId = options.appId;
  let searchApiKey = options.searchApiKey;
  let componentsPath = componentsPathOverride;
  let resolvedFlavor = flavorOverride ?? detection.detection.flavor;
  const FRAMEWORK_NONE = 'none' as const;
  let resolvedFramework: Framework | null =
    frameworkOverride !== undefined
      ? frameworkOverride
      : detection.detection.framework;

  if (prompter) {
    if (!flavorOverride) {
      resolvedFlavor = await prompter.select<Flavor>(
        `Detected flavor: ${detection.detection.flavor}. Confirm or change:`,
        [
          { name: 'react (react-instantsearch)', value: 'react' },
          { name: 'js (instantsearch.js)', value: 'js' },
        ]
      );
    }

    if (frameworkOverride === undefined && detection.detection.framework !== null) {
      const frameworkAnswer = await prompter.select<Framework | typeof FRAMEWORK_NONE>(
        `Detected framework: ${detection.detection.framework}. Confirm or change:`,
        [
          { name: 'none (plain React / Vite / CRA)', value: FRAMEWORK_NONE },
          { name: 'nextjs (Next.js App Router)', value: 'nextjs' },
        ]
      );
      resolvedFramework = frameworkAnswer === FRAMEWORK_NONE ? null : frameworkAnswer;
    }

    if (!appId) {
      appId = await prompter.text('Algolia application ID:');
    }
    if (!searchApiKey) {
      searchApiKey = await prompter.password('Algolia search-only API key:');
    }
    if (!componentsPath) {
      componentsPath = await prompter.text('Where should generated components live?', {
        default: detection.detection.componentsPath,
      });
    }
  }

  if (!appId || !searchApiKey) {
    const missing: string[] = [];
    if (!appId) missing.push('--app-id');
    if (!searchApiKey) missing.push('--search-key');
    return failure({
      command: COMMAND,
      code: 'missing_required_flag',
      message: `Missing required flags: ${missing.join(', ')}`,
    });
  }

  const credsResult = await verifyCredentials({ appId, searchApiKey });
  if (!credsResult.ok) {
    return failure({
      command: COMMAND,
      code: credsResult.code,
      message: credsResult.message,
    });
  }

  const manifest: RootManifest = {
    apiVersion: 1,
    flavor: resolvedFlavor,
    framework: resolvedFramework,
    typescript: detection.detection.typescript,
    componentsPath: componentsPath ?? detection.detection.componentsPath,
    aliases: detection.detection.aliases,
    algolia: { appId, searchApiKey },
    experiences: [],
  };

  const files = generate(manifest);
  const filesCreated = writeGeneratedFiles(projectDir, files);
  writeRootManifest(projectDir, manifest);
  filesCreated.unshift(ROOT_MANIFEST_FILENAME);

  return success({
    command: COMMAND,
    payload: {
      filesCreated,
      manifestUpdated: ROOT_MANIFEST_FILENAME,
    },
  });
}
