import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

export type PackageManager = 'npm' | 'yarn' | 'pnpm';

export type InstallResult =
  | { ok: true }
  | { ok: false; code: string; message: string };

const INSTALL_COMMANDS: Record<PackageManager, [bin: string, ...args: string[]]> = {
  yarn: ['yarn', 'add'],
  npm: ['npm', 'install'],
  pnpm: ['pnpm', 'add'],
};

export function detectPackageManager(projectDir: string): PackageManager {
  if (fs.existsSync(path.join(projectDir, 'yarn.lock'))) return 'yarn';
  if (fs.existsSync(path.join(projectDir, 'pnpm-lock.yaml'))) return 'pnpm';
  if (fs.existsSync(path.join(projectDir, 'package-lock.json'))) return 'npm';
  return 'npm';
}

export type InstallOptions = {
  stdio?: 'inherit' | 'pipe';
};

export function installPackages(
  projectDir: string,
  packages: string[],
  options: InstallOptions = {}
): InstallResult {
  const pm = detectPackageManager(projectDir);
  const [bin, ...baseArgs] = INSTALL_COMMANDS[pm];

  try {
    execFileSync(bin, [...baseArgs, ...packages], {
      cwd: projectDir,
      stdio: options.stdio ?? 'inherit',
    });
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      code: 'install_failed',
      message: `Package install failed: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}
