#!/usr/bin/env node
import { run } from './run';

async function main(): Promise<void> {
  try {
    process.exit(await run(process.argv.slice(2)));
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.stack : error}\n`);
    process.exit(1);
  }
}

main();
