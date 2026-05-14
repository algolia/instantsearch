import process from 'node:process';

import { createInquirerPrompter, type Prompter } from '../prompter';
import { type Report } from '../reporter';
import { formatHuman } from '../reporter/format-human';

export type CliRuntime = {
  json: boolean;
  yes: boolean;
  getPrompter(): Prompter | undefined;
  emitAndExit(report: Report): never;
};

export function createCliRuntime(argv: string[] = process.argv): CliRuntime {
  const json = argv.includes('--json');
  const yes = json || argv.includes('--yes');

  if (json) {
    // Commander 4.1.1 writes parse errors via console.error before throwing.
    // Silence them so --json output is a single clean JSON object on stdout.
    // eslint-disable-next-line no-console
    console.error = () => {};
  }

  return {
    json,
    yes,
    getPrompter() {
      return yes ? undefined : createInquirerPrompter();
    },
    emitAndExit(report) {
      const output = json ? JSON.stringify(report) : formatHuman(report);
      process.stdout.write(output + '\n');
      process.exit(report.ok ? 0 : 1);
    },
  };
}
