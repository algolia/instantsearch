import fs from 'node:fs';
import path from 'node:path';

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
