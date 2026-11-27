import { createProgram } from '../program';

const silentIO = {
  stdout: () => undefined,
  stderr: () => undefined,
};

function programWithNoop() {
  const program = createProgram(silentIO);
  program.command('noop').action(() => undefined);
  return program;
}

describe('global options', () => {
  describe('--json implies --yes', () => {
    it('sets yes=true when --json is passed', async () => {
      const program = programWithNoop();
      await program.parseAsync(['noop', '--json'], { from: 'user' });

      expect(program.opts()).toMatchObject({ json: true, yes: true });
    });
  });

  describe('--yes', () => {
    it('is a standalone global flag (yes=true, json=false)', async () => {
      const program = programWithNoop();
      await program.parseAsync(['noop', '--yes'], { from: 'user' });

      expect(program.opts()).toMatchObject({ json: false, yes: true });
    });

    it('defaults to false when neither --yes nor --json is passed', async () => {
      const program = programWithNoop();
      await program.parseAsync(['noop'], { from: 'user' });

      expect(program.opts()).toMatchObject({ json: false, yes: false });
    });
  });
});
