export const PROGRAM_NAME = 'create-instantsearch-app';

export function npxCommand(args: string): string {
  return `npx ${PROGRAM_NAME} ${args}`;
}
