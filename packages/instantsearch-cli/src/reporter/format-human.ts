import type { Report } from './index';
import type { NextSteps } from '../utils/next-steps';

export function formatHuman(report: Report): string {
  if (!report.ok) {
    return `Error: ${report.message}`;
  }

  const lines: string[] = [];

  switch (report.command) {
    case 'init': {
      lines.push('InstantSearch initialized.');
      break;
    }
    case 'add experience': {
      const exp = report.experience as { name: string; path: string };
      lines.push(`Experience "${exp.name}" created in ${exp.path}/`);
      break;
    }
    case 'add widget': {
      const widget = report.widget as string;
      const exp = report.experience as { name: string; path: string };
      lines.push(`Widget "${widget}" added to experience "${exp.name}".`);
      break;
    }
    default: {
      return JSON.stringify(report, null, 2);
    }
  }

  if (report.filesCreated) {
    lines.push('', filesCreatedBlock(report.filesCreated as string[]));
  }

  if (report.nextSteps) {
    lines.push('', nextStepsBlock(report.nextSteps as NextSteps));
  }

  return lines.join('\n');
}

function filesCreatedBlock(files: string[]): string {
  return ['Files created:', ...files.map((f) => `  ${f}`)].join('\n');
}

function nextStepsBlock(nextSteps: NextSteps): string {
  return [
    'Next steps:',
    '',
    ...nextSteps.imports.map((i) => `  ${i}`),
    '',
    `  ${nextSteps.mountingGuidance}`,
  ].join('\n');
}
