import fs from 'node:fs';
import path from 'node:path';

import { failure, type FailureReport } from '../reporter';

function findExistingFiles(
  projectDir: string,
  files: Map<string, string>
): string[] {
  const conflicts: string[] = [];
  for (const relativePath of files.keys()) {
    if (fs.existsSync(path.join(projectDir, relativePath))) {
      conflicts.push(relativePath);
    }
  }
  return conflicts;
}

export function fileConflict(
  projectDir: string,
  files: Map<string, string>,
  command: string
): FailureReport | null {
  const conflicts = findExistingFiles(projectDir, files);
  if (conflicts.length === 0) return null;

  return failure({
    command,
    code: 'file_conflict',
    message: `Refusing to overwrite existing files: ${conflicts.join(', ')}.`,
  });
}

export type WriteOutcome =
  | { ok: true; filesCreated: string[] }
  | { ok: false; failure: FailureReport };

export function writeOrConflict(
  projectDir: string,
  files: Map<string, string>,
  command: string
): WriteOutcome {
  const conflict = fileConflict(projectDir, files, command);
  if (conflict) return { ok: false, failure: conflict };

  return { ok: true, filesCreated: writeGeneratedFiles(projectDir, files) };
}

export function writeGeneratedFiles(
  projectDir: string,
  files: Map<string, string>
): string[] {
  const createdDirs = new Set<string>();
  for (const relativePath of files.keys()) {
    const dir = path.dirname(path.join(projectDir, relativePath));
    if (!createdDirs.has(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      createdDirs.add(dir);
    }
  }
  for (const [relativePath, contents] of files) {
    fs.writeFileSync(path.join(projectDir, relativePath), contents, 'utf8');
  }
  return Array.from(files.keys());
}
