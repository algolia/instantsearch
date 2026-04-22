import fs from 'node:fs';
import path from 'node:path';

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

const COMMAND = 'init';

export type InitOptions = {
  projectDir: string;
  flavor?: Flavor;
  framework?: Framework | null;
  componentsPath?: string;
  appId: string;
  searchApiKey: string;
};

function writeGeneratedFiles(
  projectDir: string,
  files: Map<string, string>
): string[] {
  const written: string[] = [];
  for (const [relativePath, contents] of files) {
    const absolutePath = path.join(projectDir, relativePath);
    fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
    fs.writeFileSync(absolutePath, contents, 'utf8');
    written.push(relativePath);
  }
  return written;
}

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
