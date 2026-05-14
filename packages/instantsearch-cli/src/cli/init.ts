import { detect } from '../detector';
import { generate } from '../generator';
import { installPackages } from '../installer';
import { verifyCredentials } from '../introspector';
import {
  ROOT_MANIFEST_FILENAME,
  serializeManifest,
  type RootManifest,
} from '../manifest';
import type { Prompter } from '../prompter';
import { success, failure, type Report } from '../reporter';
import type { Flavor, Framework } from '../types';
import { fileConflict, writeOrConflict } from '../utils/write-files';

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

  const result = detect(projectDir, { frameworkOverride });
  if (!result.ok) {
    return failure({
      command: COMMAND,
      code: result.code,
      message: result.message,
    });
  }

  const det = result.detection;
  const packages = det.packagesToInstall ?? [];

  let appId = options.appId;
  let searchApiKey = options.searchApiKey;
  let componentsPath = componentsPathOverride;
  let resolvedFlavor = flavorOverride ?? det.flavor;
  const FRAMEWORK_NONE = 'none' as const;
  let resolvedFramework: Framework | null =
    frameworkOverride !== undefined
      ? frameworkOverride
      : det.framework;

  if (prompter) {
    if (!flavorOverride) {
      resolvedFlavor = await prompter.select<Flavor>(
        `Detected flavor: ${det.flavor}. Confirm or change:`,
        [
          { name: 'react (react-instantsearch)', value: 'react' },
          { name: 'js (instantsearch.js)', value: 'js' },
        ]
      );
    }

    if (frameworkOverride === undefined && det.framework !== null) {
      const frameworkAnswer = await prompter.select<Framework | typeof FRAMEWORK_NONE>(
        `Detected framework: ${det.framework}. Confirm or change:`,
        [
          { name: 'none (plain React / Vite / CRA)', value: FRAMEWORK_NONE },
          { name: 'nextjs (Next.js App Router)', value: 'nextjs' },
        ]
      );
      resolvedFramework = frameworkAnswer === FRAMEWORK_NONE ? null : frameworkAnswer;
    }

    if (packages.length > 0) {
      const confirmInstall = await prompter.confirm(
        `Install ${packages.join(', ')}?`,
        { default: true }
      );
      if (!confirmInstall) {
        return failure({
          command: COMMAND,
          code: 'install_declined',
          message: 'Package installation declined.',
        });
      }
    }

    if (!appId) {
      appId = await prompter.text('Algolia application ID:');
    }
    if (!searchApiKey) {
      searchApiKey = await prompter.password('Algolia search-only API key:');
    }
    if (!componentsPath) {
      componentsPath = await prompter.text('Where should generated components live?', {
        default: det.componentsPath,
      });
    }
  }

  if (!appId || !searchApiKey) {
    const missing: string[] = [];
    if (!appId) missing.push('--app-id');
    if (!searchApiKey) missing.push('--search-api-key');
    return failure({
      command: COMMAND,
      code: 'missing_required_flag',
      message: `Missing required flags: ${missing.join(', ')}`,
    });
  }

  const manifest: RootManifest = {
    apiVersion: 1,
    flavor: resolvedFlavor,
    framework: resolvedFramework,
    typescript: det.typescript,
    componentsPath: componentsPath ?? det.componentsPath,
    aliases: det.aliases,
    algolia: { appId, searchApiKey },
    features: [],
  };

  const files = new Map([
    [ROOT_MANIFEST_FILENAME, serializeManifest(manifest)],
    ...generate(manifest),
  ]);
  const conflict = fileConflict(projectDir, files, COMMAND);
  if (conflict) return conflict;

  if (packages.length > 0) {
    const installResult = installPackages(projectDir, packages, {
      stdio: prompter ? 'inherit' : 'pipe',
    });
    if (!installResult.ok) {
      return failure({
        command: COMMAND,
        code: installResult.code,
        message: installResult.message,
      });
    }
  }

  const credsResult = await verifyCredentials({ appId, searchApiKey });
  if (!credsResult.ok) {
    return failure({
      command: COMMAND,
      code: credsResult.code,
      message: credsResult.message,
    });
  }

  const outcome = writeOrConflict(projectDir, files, COMMAND);
  if (!outcome.ok) return outcome.failure;

  return success({
    command: COMMAND,
    payload: {
      filesCreated: outcome.filesCreated,
      manifestUpdated: ROOT_MANIFEST_FILENAME,
      nextSteps: manifest.flavor === 'react'
        ? {
            imports: [`import { AlgoliaProvider } from 'src/lib/algolia-provider';`],
            mountingGuidance: 'Wrap your app with <AlgoliaProvider> high in the component tree (e.g., root layout).',
          }
        : {
            imports: [`import { search } from 'src/lib/algolia-provider';`],
            mountingGuidance: 'Import the search instance in each page entry point, add widgets, and call search.start().',
          },
    },
  });
}
