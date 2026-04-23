import { detect } from '../detector';
import { generate } from '../generator';
import { verifyCredentials } from '../introspector';
import {
  writeRootManifest,
  ROOT_MANIFEST_FILENAME,
  type RootManifest,
} from '../manifest';
import { success, failure, type Report } from '../reporter';
import type { Flavor, Framework } from '../types';
import { writeGeneratedFiles } from '../utils/write-files';

const COMMAND = 'init';

export type InitOptions = {
  projectDir: string;
  flavor?: Flavor;
  framework?: Framework | null;
  componentsPath?: string;
  appId: string;
  searchApiKey: string;
};

export async function init(options: InitOptions): Promise<Report> {
  const {
    projectDir,
    flavor: flavorOverride,
    framework: frameworkOverride,
    componentsPath: componentsPathOverride,
    appId,
    searchApiKey,
  } = options;

  const detection = detect(projectDir);
  if (!detection.ok) {
    return failure({
      command: COMMAND,
      code: detection.code,
      message: detection.message,
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
    flavor: flavorOverride ?? detection.detection.flavor,
    framework:
      frameworkOverride !== undefined
        ? frameworkOverride
        : detection.detection.framework,
    typescript: detection.detection.typescript,
    componentsPath: componentsPathOverride ?? detection.detection.componentsPath,
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
