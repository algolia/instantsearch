import { z } from 'zod';

// Change types from CHANGELOG parsing
export const ChangeTypeSchema = z.enum([
  'feature',
  'fix',
  'breaking',
  'deprecation',
  'refactor',
  'docs',
  'chore',
  'revert',
]);

export type ChangeType = z.infer<typeof ChangeTypeSchema>;

export const ChangeEntrySchema = z.object({
  type: ChangeTypeSchema,
  scope: z.string().optional(),
  description: z.string(),
  prNumber: z.number().optional(),
  commitHash: z.string().optional(),
  isBreaking: z.boolean().default(false),
});

export type ChangeEntry = z.infer<typeof ChangeEntrySchema>;

export const ReleaseSchema = z.object({
  version: z.string(),
  date: z.string().optional(),
  packageName: z.string(),
  changes: z.array(ChangeEntrySchema),
  compareUrl: z.string().optional(),
});

export type Release = z.infer<typeof ReleaseSchema>;

// Documentation priority levels
export const DocPrioritySchema = z.enum(['high', 'medium', 'low', 'none']);
export type DocPriority = z.infer<typeof DocPrioritySchema>;

// Content types for documentation
export type ContentType =
  | 'widget-docs'
  | 'hook-docs'
  | 'connector-docs'
  | 'api-update'
  | 'migration-guide'
  | 'release-notes';

export interface DocumentationNeed {
  release: Release;
  changes: ChangeEntry[];
  priority: DocPriority;
  suggestedContentTypes: ContentType[];
}

// CLI options
export interface CLIOptions {
  dryRun: boolean;
  verbose: boolean;
  package?: string;
  version?: string;
  outputDir?: string;
}
